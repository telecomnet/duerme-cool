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

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'token_required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Look up subscriber by token and unconfirmed status
    const { data: subscriber, error: selectErr } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, preferred_language')
      .eq('confirmation_token', token)
      .eq('confirmed', false)
      .single()

    if (selectErr || !subscriber) {
      console.warn('Token not found or already confirmed:', token)
      return new Response(
        JSON.stringify({ error: 'token_not_found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Confirm the subscription
    const { error: confirmErr } = await supabase
      .from('newsletter_subscribers')
      .update({ confirmed: true, confirmation_token: null })
      .eq('id', subscriber.id)

    if (confirmErr) {
      console.error('Confirm update failed:', confirmErr.message)
      return new Response(JSON.stringify({ error: 'confirm_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Check if customer exists with this email and sync newsletter_opt_in
    const { data: customer, error: customerErr } = await supabase
      .from('customers')
      .select('id')
      .eq('email', subscriber.email)
      .single()

    if (!customerErr && customer) {
      const { error: updateErr } = await supabase
        .from('customers')
        .update({ newsletter_opt_in: true })
        .eq('id', customer.id)

      if (updateErr) {
        console.warn('Customer sync failed:', updateErr.message)
        // Don't fail the response — the subscription is already confirmed
      }
    }

    console.log(`Newsletter subscription confirmed for ${subscriber.email}`)

    return new Response(
      JSON.stringify({
        success: true,
        email: subscriber.email,
        language: subscriber.preferred_language,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
