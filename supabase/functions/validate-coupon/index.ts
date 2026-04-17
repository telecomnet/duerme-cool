import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SRK') ?? '',
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, email, amount } = await req.json()

    if (!code || !email || typeof amount !== 'number') {
      return new Response(
        JSON.stringify({ valid: false, error: 'missing_fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      )
    }

    // ── Atomic validate + increment via RPC ───────────────────────────────────
    const { data, error } = await supabase.rpc('validate_and_apply_coupon', {
      p_code:   code.trim().toUpperCase(),
      p_email:  email.trim().toLowerCase(),
      p_amount: Math.round(amount),
    })

    if (error) {
      console.error('RPC error:', error.message)
      throw new Error(error.message)
    }

    const result = data?.[0]
    if (!result) throw new Error('No result from RPC')

    if (!result.valid) {
      return new Response(
        JSON.stringify({ valid: false, error: result.error_code }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    }

    // ── Record usage (non-fatal) ──────────────────────────────────────────────
    // order_id is null here — it will be backfilled in create-payment-intent
    const { error: usageErr } = await supabase.from('coupon_usage').insert({
      coupon_id: result.coupon_id,
      email:     email.trim().toLowerCase(),
      order_id:  null,
    })
    if (usageErr) console.error('coupon_usage insert error:', usageErr.message)

    console.log(`✅ Coupon validated: ${code} for ${email}, discount: ${result.discount_amount} cents`)

    return new Response(
      JSON.stringify({
        valid:         true,
        couponId:      result.coupon_id,
        discountType:  result.discount_type,
        discountValue: result.discount_value,
        discountAmount: result.discount_amount,
        finalAmount:   result.final_amount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('validate-coupon error:', message)
    return new Response(
      JSON.stringify({ valid: false, error: 'server_error', details: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
