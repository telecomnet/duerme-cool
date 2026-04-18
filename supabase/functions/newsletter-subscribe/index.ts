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
    const { email, name, language } = await req.json()

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

    // Upsert subscriber - try update first, then insert
    const updateResp = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': srkKey,
        'Authorization': `Bearer ${srkKey}`,
      },
      body: JSON.stringify({
        name: name || null,
        confirmed: false,
        confirmation_token: token,
        preferred_language: language || 'es',
        subscribed_at: new Date().toISOString(),
      }),
    })

    const updateText = await updateResp.text()
    if (!updateResp.ok && updateResp.status !== 404) {
      throw new Error(`Supabase error: ${updateText}`)
    }

    // If update didn't find anything (404 or empty), insert new record
    // Status 200 means update succeeded, status 404 means no matching row
    if (updateResp.status === 404 || updateText.length === 0) {
      const insertResp = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': srkKey,
          'Authorization': `Bearer ${srkKey}`,
        },
        body: JSON.stringify({
          email,
          name: name || null,
          confirmed: false,
          confirmation_token: token,
          preferred_language: language || 'es',
          subscribed_at: new Date().toISOString(),
        }),
      })

      if (!insertResp.ok) {
        const err = await insertResp.text()
        throw new Error(`Supabase error: ${err}`)
      }
    }

    console.log(`✅ Newsletter subscriber processed: ${email}`)

    // Send confirmation email
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://duerme.cool'
    const confirmUrl = `${siteUrl}/newsletter/confirm?token=${token}`
    const lang = (language === 'en' ? 'en' : 'es') as 'es' | 'en'

    const subject = lang === 'es'
      ? 'Confirma tu suscripción a Duerme.cool'
      : 'Confirm your Duerme.cool subscription'

    const html = lang === 'es'
      ? `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;margin:0;padding:20px;background:#f1f5f9;"><table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);"><tr><td style="background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:40px;text-align:center;"><h1 style="margin:0;font-size:28px;font-weight:bold;">¡Confirma tu suscripción!</h1></td></tr><tr><td style="padding:40px;"><p style="margin:0 0 20px;font-size:16px;color:#333;">Hola${name ? ' ' + name : ''},</p><p style="margin:0 0 24px;font-size:14px;color:#666;">Haz clic en el botón abajo para confirmar tu suscripción a Duerme.cool.</p><div style="text-align:center;margin:30px 0;"><a href="${confirmUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;">Confirmar</a></div></td></tr></table></body></html>`
      : `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;margin:0;padding:20px;background:#f1f5f9;"><table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);"><tr><td style="background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:40px;text-align:center;"><h1 style="margin:0;font-size:28px;font-weight:bold;">Confirm your subscription!</h1></td></tr><tr><td style="padding:40px;"><p style="margin:0 0 20px;font-size:16px;color:#333;">Hi${name ? ' ' + name : ''},</p><p style="margin:0 0 24px;font-size:14px;color:#666;">Click below to confirm your subscription to Duerme.cool.</p><div style="text-align:center;margin:30px 0;"><a href="${confirmUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;">Confirm</a></div></td></tr></table></body></html>`

    // Send via SMTP (fire and forget - don't wait)
    const smtpHostname = Deno.env.get('SMTP_HOSTNAME') ?? 'stealth.websitewelcome.com'
    const smtpPort = Number(Deno.env.get('SMTP_PORT') ?? '465')
    const smtpUsername = Deno.env.get('SMTP_USERNAME') ?? 'contacto@duerme.cool'
    const smtpPassword = Deno.env.get('SMTP_PASSWORD') ?? ''

    // Send email asynchronously without blocking response
    sendEmailAsync(smtpHostname, smtpPort, smtpUsername, smtpPassword, email, subject, html)
      .catch((err) => console.error('Email send error:', err))

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

// Send email without blocking - fire and forget
async function sendEmailAsync(
  hostname: string,
  port: number,
  username: string,
  password: string,
  to: string,
  subject: string,
  html: string,
) {
  try {
    console.log(`📧 Starting email send to ${to} via ${hostname}:${port}`)

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    function b64(str: string): string {
      const bytes = encoder.encode(str)
      let binary = ''
      for (const byte of bytes) binary += String.fromCharCode(byte)
      return btoa(binary)
    }

    console.log(`🔗 Connecting to ${hostname}:${port}...`)
    const conn = await Deno.connectTls({ hostname, port })
    console.log(`✅ Connected`)

    let buf = new Uint8Array(4096)
    let n = await conn.read(buf)
    const greeting = decoder.decode(buf.subarray(0, n ?? 0))
    console.log(`📨 Server greeting: ${greeting.trim()}`)

    console.log(`📤 Sending EHLO...`)
    await conn.write(encoder.encode('EHLO duerme.cool\r\n'))
    buf = new Uint8Array(4096)
    n = await conn.read(buf)
    console.log(`📨 EHLO response: ${decoder.decode(buf.subarray(0, n ?? 0)).trim()}`)

    console.log(`📤 Sending AUTH LOGIN...`)
    await conn.write(encoder.encode('AUTH LOGIN\r\n'))
    buf = new Uint8Array(4096)
    n = await conn.read(buf)
    console.log(`📨 AUTH response: ${decoder.decode(buf.subarray(0, n ?? 0)).trim()}`)

    console.log(`📤 Sending username...`)
    await conn.write(encoder.encode(b64(username) + '\r\n'))
    buf = new Uint8Array(4096)
    n = await conn.read(buf)
    console.log(`📨 Username response: ${decoder.decode(buf.subarray(0, n ?? 0)).trim()}`)

    console.log(`📤 Sending password...`)
    await conn.write(encoder.encode(b64(password) + '\r\n'))
    buf = new Uint8Array(4096)
    n = await conn.read(buf)
    const authResp = decoder.decode(buf.subarray(0, n ?? 0)).trim()
    console.log(`📨 Password response: ${authResp}`)
    if (!authResp.startsWith('235')) throw new Error(`Auth failed: ${authResp}`)
    console.log(`✅ Authentication successful`)

    console.log(`📤 Sending MAIL FROM...`)
    await conn.write(encoder.encode(`MAIL FROM:<${username}>\r\n`))
    buf = new Uint8Array(4096)
    n = await conn.read(buf)
    console.log(`📨 MAIL FROM response: ${decoder.decode(buf.subarray(0, n ?? 0)).trim()}`)

    console.log(`📤 Sending RCPT TO...`)
    await conn.write(encoder.encode(`RCPT TO:<${to}>\r\n`))
    buf = new Uint8Array(4096)
    n = await conn.read(buf)
    const rcptResp = decoder.decode(buf.subarray(0, n ?? 0)).trim()
    console.log(`📨 RCPT TO response: ${rcptResp}`)

    console.log(`📤 Sending DATA...`)
    await conn.write(encoder.encode('DATA\r\n'))
    buf = new Uint8Array(4096)
    n = await conn.read(buf)
    console.log(`📨 DATA response: ${decoder.decode(buf.subarray(0, n ?? 0)).trim()}`)

    console.log(`📤 Sending message...`)
    const msg = `From: Duerme.cool <${username}>\r\nTo: ${to}\r\nSubject: =?UTF-8?B?${b64(subject)}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n.\r\n`
    await conn.write(encoder.encode(msg))
    buf = new Uint8Array(4096)
    n = await conn.read(buf)
    const sendResp = decoder.decode(buf.subarray(0, n ?? 0)).trim()
    console.log(`📨 Send response: ${sendResp}`)

    console.log(`📤 Sending QUIT...`)
    await conn.write(encoder.encode('QUIT\r\n'))
    conn.close()

    console.log(`✅ Email successfully sent to ${to}`)
  } catch (err) {
    console.error(`❌ Email error for ${to}:`, err instanceof Error ? err.message : err)
    console.error(`Stack:`, err instanceof Error ? err.stack : 'N/A')
  }
}
