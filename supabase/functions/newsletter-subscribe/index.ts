import { buildNewsletterConfirmationEmail } from '../_shared/email-templates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  try {
    const { email, name, language, website } = await req.json()

    // ── Honeypot ────────────────────────────────────────────────────────────
    // `website` is a hidden field real users never fill in. Bots that
    // auto-fill every input on the form will populate it. Pretend success
    // without doing anything, so the bot has no signal to react to.
    if (website) {
      console.warn('Newsletter honeypot triggered, ignoring submission')
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Generate token
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

    // Call Supabase via HTTP to avoid Node.js compatibility issues
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const srkKey = Deno.env.get('SRK') ?? ''

    if (!supabaseUrl || !srkKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Normalize email to lowercase for consistent lookups
    const normalizedEmail = email.trim().toLowerCase()

    // ── Rate limiting ─────────────────────────────────────────────────────────
    // Someone can otherwise use this public, no-login form to email-bomb a
    // third party by resubmitting their address, or script many different
    // victim addresses from one place. Cap both.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || 'unknown'

    const restHeaders = {
      'apikey': srkKey,
      'Authorization': `Bearer ${srkKey}`,
    }

    const EMAIL_COOLDOWN_MINUTES = 10
    const IP_MAX_PER_HOUR = 5

    const cooldownSince = new Date(Date.now() - EMAIL_COOLDOWN_MINUTES * 60 * 1000).toISOString()
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const [recentForEmailResp, recentForIpResp] = await Promise.all([
      fetch(
        `${supabaseUrl}/rest/v1/newsletter_send_log?select=id&email=eq.${encodeURIComponent(normalizedEmail)}&created_at=gte.${cooldownSince}&limit=1`,
        { headers: restHeaders },
      ),
      fetch(
        `${supabaseUrl}/rest/v1/newsletter_send_log?select=id&ip=eq.${encodeURIComponent(ip)}&created_at=gte.${hourAgo}`,
        { headers: restHeaders },
      ),
    ])

    const recentForEmail: unknown[] = recentForEmailResp.ok ? await recentForEmailResp.json() : []
    const recentForIp: unknown[] = recentForIpResp.ok ? await recentForIpResp.json() : []

    if (recentForIp.length >= IP_MAX_PER_HOUR) {
      console.warn(`Newsletter rate limit hit for ip ${ip}`)
      return new Response(
        JSON.stringify({ error: 'rate_limited' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const alreadySentRecently = recentForEmail.length > 0

    // Use Supabase REST API upsert with on_conflict
    const upsertResp = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers?on_conflict=email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': srkKey,
        'Authorization': `Bearer ${srkKey}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        name: name || null,
        confirmed: false,
        confirmation_token: token,
        preferred_language: language || 'es',
        subscribed_at: new Date().toISOString(),
      }),
    })

    if (!upsertResp.ok) {
      const err = await upsertResp.text()
      throw new Error(`Supabase error: ${err}`)
    }

    console.log(`✅ Newsletter subscriber processed: ${email}`)

    // ── Send confirmation email — skipped if one already went out to this
    //    address inside the cooldown window (still a success response, so a
    //    real user double-clicking sees no error) ────────────────────────────
    if (!alreadySentRecently) {
      const siteUrl = Deno.env.get('SITE_URL') ?? 'https://duerme.cool'
      const confirmUrl = `${siteUrl}/newsletter/confirm?token=${token}`
      const lang = (language === 'en' ? 'en' : 'es') as 'es' | 'en'

      const { subject, html } = buildNewsletterConfirmationEmail({
        name: name || (lang === 'es' ? 'Suscriptor' : 'Subscriber'),
        confirmUrl,
        language: lang,
      })

      const smtpConfig: SmtpConfig = {
        hostname: Deno.env.get('SMTP_HOSTNAME') ?? 'stealth.websitewelcome.com',
        port:     Number(Deno.env.get('SMTP_PORT') ?? '465'),
        username: Deno.env.get('SMTP_USERNAME') ?? 'contacto@duerme.cool',
        password: Deno.env.get('SMTP_PASSWORD') ?? '',
      }

      // Send email asynchronously without blocking response
      sendEmailAsync({
        smtp: smtpConfig,
        from: `Duerme.cool <${smtpConfig.username}>`,
        to: email,
        subject,
        html,
      }).catch((err) => console.error('Email send error:', err))

      // Record the send for rate limiting — fire and forget
      fetch(`${supabaseUrl}/rest/v1/newsletter_send_log`, {
        method: 'POST',
        headers: { ...restHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, ip }),
      }).catch((err) => console.warn('newsletter_send_log insert error:', err))
    } else {
      console.log(`Newsletter confirmation skipped (cooldown) for ${normalizedEmail}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Newsletter error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})

// ── SMTP helper ───────────────────────────────────────────────────────────────
interface SmtpConfig {
  hostname: string
  port: number
  username: string
  password: string
}

async function sendEmailAsync({
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

  // ── Connect to external SMTP server via TLS ──────────────────────────────────
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
  // BCC to duermecool@gmail.com
  await write('RCPT TO:<duermecool@gmail.com>')
  await read()

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
