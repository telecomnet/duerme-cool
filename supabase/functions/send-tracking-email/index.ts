import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SRK') ?? '',
)

// ── SMTP sender (same as stripe-webhook) ──────────────────────────────────────
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
  subject,
  html,
}: {
  smtp: SmtpConfig
  from: string
  to: string
  subject: string
  html: string
}): Promise<void> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  function b64(str: string): string {
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
  }

  function foldB64(str: string): string {
    return str.match(/.{1,76}/g)?.join('\r\n') ?? str
  }

  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const date     = new Date().toUTCString()
  const msgId    = `<${Date.now()}.${Math.random().toString(36).slice(2)}@duerme.cool>`

  const encodedSubject = `=?UTF-8?B?${b64(subject)}?=`
  const htmlB64        = b64(html)

  const headers = [
    `Date: ${date}`,
    `Message-ID: ${msgId}`,
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join('\r\n')

  const bodyPart = [
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    foldB64(htmlB64),
    ``,
    `--${boundary}--`,
  ].join('\r\n')

  const message = `${headers}\r\n\r\n${bodyPart}`

  const tlsConn = await Deno.connectTls({ hostname: smtp.hostname, port: smtp.port })

  function makePair(c: Deno.TlsConn) {
    return {
      read: async (): Promise<string> => {
        const buf = new Uint8Array(4096)
        const n = await c.read(buf)
        return decoder.decode(buf.subarray(0, n ?? 0))
      },
      write: async (line: string): Promise<void> => {
        await c.write(encoder.encode(line + '\r\n'))
      },
      writeRaw: async (data: string): Promise<void> => {
        await c.write(encoder.encode(data))
      },
    }
  }

  let { read, write, writeRaw } = makePair(tlsConn)

  await read()
  await write('EHLO duerme.cool')
  await read()

  await write('AUTH LOGIN')
  await read()
  await write(b64(smtp.username))
  await read()
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

  await write('DATA')
  await read()

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

  try {
    const { order_id, tracking_number, carrier, tracking_url, language } = await req.json()

    if (!order_id || !tracking_number) {
      return new Response(
        JSON.stringify({ error: 'Missing order_id or tracking_number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Fetch order + customer
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select(`
        id, order_number, items,
        customers ( email, full_name )
      `)
      .eq('id', order_id)
      .single()

    if (orderErr || !order) {
      console.error('Order not found:', order_id, orderErr?.message)
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers
    if (!customer?.email) {
      return new Response(JSON.stringify({ error: 'Customer email not found' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const lang = (language ?? 'es') as 'es' | 'en'

    // Build email
    const subject = lang === 'es'
      ? `📦 Tu pedido ${order.order_number} está en camino`
      : `📦 Your order ${order.order_number} is on the way`

    const html = lang === 'es'
      ? `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;margin:0;padding:20px;background:#f1f5f9;">
<table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:40px;text-align:center;">
<h1 style="margin:0;font-size:28px;font-weight:bold;">¡Tu pedido está en camino!</h1></td></tr>
<tr><td style="padding:40px;">
<p style="margin:0 0 20px;font-size:16px;color:#333;">Hola ${customer.full_name || 'Cliente'},</p>
<p style="margin:0 0 24px;font-size:14px;color:#666;">Tu pedido <strong>${order.order_number}</strong> ha sido despachado y está en camino a tu dirección.</p>
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px;margin:24px 0;">
<p style="margin:0 0 12px;font-size:13px;color:#059669;font-weight:700;text-transform:uppercase;">INFORMACIÓN DE RASTREO</p>
<p style="margin:0 0 8px;font-size:16px;color:#333;"><strong>${carrier}</strong></p>
<p style="margin:0;font-size:14px;font-family:monospace;color:#666;">${tracking_number}</p>
${tracking_url ? `<p style="margin:12px 0 0;"><a href="${tracking_url}" style="color:#059669;text-decoration:none;font-weight:bold;">Rastrear envío →</a></p>` : ''}
</div>
<p style="margin:0;font-size:12px;color:#999;">Para más información, contáctanos a contacto@duerme.cool</p>
</td></tr></table>
</body></html>`
      : `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;margin:0;padding:20px;background:#f1f5f9;">
<table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:40px;text-align:center;">
<h1 style="margin:0;font-size:28px;font-weight:bold;">Your order is on the way!</h1></td></tr>
<tr><td style="padding:40px;">
<p style="margin:0 0 20px;font-size:16px;color:#333;">Hi ${customer.full_name || 'Customer'},</p>
<p style="margin:0 0 24px;font-size:14px;color:#666;">Your order <strong>${order.order_number}</strong> has been dispatched and is on its way to you.</p>
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px;margin:24px 0;">
<p style="margin:0 0 12px;font-size:13px;color:#059669;font-weight:700;text-transform:uppercase;">TRACKING INFORMATION</p>
<p style="margin:0 0 8px;font-size:16px;color:#333;"><strong>${carrier}</strong></p>
<p style="margin:0;font-size:14px;font-family:monospace;color:#666;">${tracking_number}</p>
${tracking_url ? `<p style="margin:12px 0 0;"><a href="${tracking_url}" style="color:#059669;text-decoration:none;font-weight:bold;">Track shipment →</a></p>` : ''}
</div>
<p style="margin:0;font-size:12px;color:#999;">For more info, contact us at contacto@duerme.cool</p>
</td></tr></table>
</body></html>`

    const smtpConfig: SmtpConfig = {
      hostname: Deno.env.get('SMTP_HOSTNAME') ?? 'stealth.websitewelcome.com',
      port:     Number(Deno.env.get('SMTP_PORT') ?? '465'),
      username: Deno.env.get('SMTP_USERNAME') ?? 'contacto@duerme.cool',
      password: Deno.env.get('SMTP_PASSWORD') ?? '',
    }

    await sendEmail({
      smtp: smtpConfig,
      from: `Duerme.cool <${smtpConfig.username}>`,
      to: customer.email,
      subject,
      html,
    })

    console.log(`Tracking email sent for order ${order.order_number} to ${customer.email}`)

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
