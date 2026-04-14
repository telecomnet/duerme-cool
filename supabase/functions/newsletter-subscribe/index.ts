import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'
import { buildNewsletterConfirmationEmail } from '../_shared/email-templates.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

  const conn = await Deno.connect({ hostname: smtp.hostname, port: smtp.port })

  function makePair(c: Deno.Conn | Deno.TlsConn) {
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

  let { read, write, writeRaw } = makePair(conn)

  await read()
  await write('EHLO duerme.cool')
  await read()

  await write('STARTTLS')
  await read()

  const tlsConn = await Deno.startTls(conn, { hostname: smtp.hostname })
  ;({ read, write, writeRaw } = makePair(tlsConn))

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
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' },
    })
  }

  try {
    const { name, email, language } = await req.json()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'invalid_email' }),
        { status: 400 },
      )
    }

    const lang = (language ?? 'es') as 'es' | 'en'

    // Generate token: 64 hex chars (same format as encode(gen_random_bytes(32), 'hex'))
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

    // Upsert subscriber with new token
    const { error: upsertErr } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email,
          name: name || null,
          confirmed: false,
          confirmation_token: token,
          preferred_language: lang,
        },
        { onConflict: 'email', ignoreDuplicates: false },
      )

    if (upsertErr) {
      console.error('Upsert failed:', upsertErr.message)
      return new Response(JSON.stringify({ error: 'subscription_failed' }), { status: 500 })
    }

    // Build confirmation URL
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://duerme.cool'
    const confirmUrl = `${siteUrl}/newsletter/confirm?token=${token}`

    // Build email
    const { subject, html } = buildNewsletterConfirmationEmail({
      name: name || (lang === 'es' ? 'Amigo/a' : 'Friend'),
      confirmUrl,
      language: lang,
    })

    // Send confirmation email
    const smtpConfig: SmtpConfig = {
      hostname: Deno.env.get('SMTP_HOSTNAME') ?? 'smtp.gmail.com',
      port:     Number(Deno.env.get('SMTP_PORT') ?? '587'),
      username: Deno.env.get('SMTP_USERNAME') ?? 'duermecool@gmail.com',
      password: Deno.env.get('SMTP_PASSWORD') ?? '',
    }

    await sendEmail({
      smtp: smtpConfig,
      from: `Duerme.cool <${smtpConfig.username}>`,
      to: email,
      subject,
      html,
    })

    console.log(`Newsletter confirmation email sent to ${email}`)

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
})
