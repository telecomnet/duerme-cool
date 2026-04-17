import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'
import { buildOrderConfirmationEmail } from '../_shared/email-templates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SRK') ?? '',
)

// ── SMTP helper ───────────────────────────────────────────────────────────────
interface SmtpConfig {
  hostname: string
  port: number
  username: string
  password: string
}

async function sendEmail({
  smtp,
  from,
  to,
  cc,
  subject,
  html,
}: {
  smtp: SmtpConfig
  from: string
  to: string
  cc?: string
  subject: string
  html: string
}): Promise<void> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  // Encode a UTF-8 string to base64 — handles emoji and non-ASCII safely
  function b64(str: string): string {
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
  }

  // RFC 2045 §6.8 — fold base64 body at 76 chars per line
  function foldB64(str: string): string {
    return str.match(/.{1,76}/g)?.join('\r\n') ?? str
  }

  // ── MIME message (RFC 2822) ────────────────────────────────────────────────
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const date     = new Date().toUTCString()
  const msgId    = `<${Date.now()}.${Math.random().toString(36).slice(2)}@duerme.cool>`

  // RFC 2047 B-encoding for subject so emoji/non-ASCII render correctly
  const headers = [
    `Date: ${date}`,
    `Message-ID: ${msgId}`,
    `From: ${from}`,
    `To: ${to}`,
    ...(cc ? [`Cc: ${cc}`] : []),
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join('\r\n')

  const bodyPart = [
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    foldB64(b64(html)),
    ``,
    `--${boundary}--`,
  ].join('\r\n')

  // RFC 2822: headers + blank line (CRLF CRLF) + body
  const message = `${headers}\r\n\r\n${bodyPart}`

  // ── TLS connect (SSL on port 465) ───────────────────────────────────────────
  const tlsConn = await Deno.connectTls({ hostname: smtp.hostname, port: smtp.port })

  function makePair(c: Deno.TlsConn) {
    return {
      read: async (): Promise<string> => {
        const buf = new Uint8Array(4096)
        const n = await c.read(buf)
        return decoder.decode(buf.subarray(0, n ?? 0))
      },
      // Write a single SMTP command line (appends CRLF)
      write: async (line: string): Promise<void> => {
        await c.write(encoder.encode(line + '\r\n'))
      },
      // Write raw bytes — used for DATA payload so we control all CRLFs
      writeRaw: async (data: string): Promise<void> => {
        await c.write(encoder.encode(data))
      },
    }
  }

  let { read, write, writeRaw } = makePair(tlsConn)

  await read()                         // 220 greeting
  await write('EHLO duerme.cool')
  await read()                         // 250 capabilities

  // AUTH LOGIN
  await write('AUTH LOGIN')
  await read()                         // 334 username prompt
  await write(b64(smtp.username))
  await read()                         // 334 password prompt
  await write(b64(smtp.password))
  const authResp = await read()
  if (!authResp.startsWith('235')) {
    tlsConn.close()
    throw new Error(`SMTP auth failed: ${authResp}`)
  }

  await write(`MAIL FROM:<${smtp.username}>`)
  await read()
  await write(`RCPT TO:<${to}>`)
  await read()
  if (cc) {
    await write(`RCPT TO:<${cc}>`)
    await read()
  }

  await write('DATA')
  await read()                         // 354 Start input, end with <CRLF>.<CRLF>

  // Send message + RFC 2821 end-of-data terminator as one raw write
  await writeRaw(message + '\r\n.\r\n')
  const dataResp = await read()
  if (!dataResp.startsWith('250')) {
    tlsConn.close()
    throw new Error(`SMTP DATA failed: ${dataResp}`)
  }

  await write('QUIT')
  tlsConn.close()
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://duerme.cool'

  const body = await req.text()

  // ── 1. Verify Stripe signature ─────────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? '', webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook verification failed'
    console.error('Stripe signature error:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // ── 2. Only handle payment_intent.succeeded ────────────────────────────────
  if (event.type !== 'payment_intent.succeeded') {
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const pi = event.data.object as Stripe.PaymentIntent

  try {
    // ── 3. Fetch order + customer from Supabase ──────────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        tracking_token,
        items,
        total_amount,
        currency,
        stripe_payment_intent_id,
        created_at,
        language,
        customer:customers (
          id,
          email,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          zip,
          country
        )
      `)
      .eq('stripe_payment_intent_id', pi.id)
      .single()

    if (orderErr || !order) {
      console.error('Order not found for PI:', pi.id, orderErr?.message)
      // Return 200 so Stripe doesn't retry — order may not exist if insert failed
      return new Response(JSON.stringify({ received: true, warning: 'order not found' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ── 4. Mark order as paid ────────────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', order.id)

    if (updateErr) console.error('Failed to mark order paid:', updateErr.message)

    // ── 5. Build email ───────────────────────────────────────────────────────
    const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer

    if (!customer?.email) {
      console.error('No customer email for order:', order.id)
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const lang = (order.language === 'en' ? 'en' : 'es') as 'es' | 'en'

    const { subject, html } = buildOrderConfirmationEmail({
      order: {
        id:                       order.id,
        order_number:             order.order_number ?? `#${order.id.slice(0, 8).toUpperCase()}`,
        tracking_token:           order.tracking_token,
        items:                    order.items ?? [],
        total_amount:             order.total_amount,
        currency:                 order.currency,
        stripe_payment_intent_id: order.stripe_payment_intent_id,
        created_at:               order.created_at,
        language:                 lang,
      },
      customer: {
        email:         customer.email,
        full_name:     customer.full_name ?? '',
        phone:         customer.phone,
        address_line1: customer.address_line1 ?? '',
        address_line2: customer.address_line2,
        city:          customer.city ?? '',
        state:         customer.state ?? '',
        zip:           customer.zip ?? '',
        country:       customer.country ?? 'MX',
      },
      language: lang,
      siteUrl,
    })

    // ── 6. Send email via VPS SMTP ───────────────────────────────────────────
    const smtpConfig: SmtpConfig = {
      hostname: Deno.env.get('SMTP_HOSTNAME') ?? '',
      port:     Number(Deno.env.get('SMTP_PORT') ?? '465'),
      username: Deno.env.get('SMTP_USERNAME') ?? 'contacto@duerme.cool',
      password: Deno.env.get('SMTP_PASSWORD') ?? '',
    }

    await sendEmail({
      smtp:    smtpConfig,
      from:    `Duerme.cool <${smtpConfig.username}>`,
      to:      customer.email,
      subject,
      html,
    })

    console.log(`Email sent for order ${order.order_number} to ${customer.email}`)

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook handler error:', msg)
    // Return 200 to prevent Stripe retries for non-signature errors
    return new Response(JSON.stringify({ received: true, error: msg }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
