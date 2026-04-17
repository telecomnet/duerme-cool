import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'
import { corsHeaders } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
})

// Service-role client — bypasses RLS, never exposed to the browser
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SRK') ?? '',
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      amount,
      currency,
      contact,
      shipping,
      items,
      language,
      couponCode      = null,
      discountAmount  = 0,
      originalAmount  = null,
    } = await req.json()

    if (!amount || !currency) throw new Error('Missing required fields: amount, currency')

    // ── 1. Upsert customer (email is the unique key) ─────────────────────────
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(
        {
          email:        contact.email,
          phone:        contact.phone        || null,
          newsletter:   contact.newsletter   ?? false,
          full_name:    shipping.fullName,
          address_line1: shipping.addressLine1,
          address_line2: shipping.addressLine2 || null,
          city:         shipping.city,
          state:        shipping.state,
          zip:          shipping.zip,
          country:      'MX',
        },
        { onConflict: 'email' },
      )
      .select('id')
      .single()

    if (customerError) {
      console.error('Customer upsert error:', customerError.message)
      // Non-fatal — continue with payment even if DB write fails
    }

    // ── 2. Create Stripe PaymentIntent ───────────────────────────────────────
    // Note: Prices include IVA 16% (inclusive tax). Stripe will show the full amount.
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount:   Math.round(amount),
        currency,
        payment_method_types: ['card'],
        receipt_email: contact.email,
        metadata: {
          customer_id: customer?.id ?? '',
          phone:       contact.phone     ?? '',
          newsletter:  String(contact.newsletter ?? false),
          full_name:   shipping.fullName ?? '',
          address:     `${shipping.addressLine1}, ${shipping.city}, ${shipping.state} ${shipping.zip}`,
          items:       JSON.stringify(items ?? []),
          coupon_code: couponCode ?? '',
          discount_amount: String(discountAmount ?? 0),
        },
      })
    } catch (stripeErr) {
      console.error('Stripe PaymentIntent error:', stripeErr)
      throw stripeErr
    }

    // ── 3. Create order record ───────────────────────────────────────────────
    if (customer?.id) {
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        customer_id:              customer.id,
        items:                    items ?? [],
        total_amount:             Math.round(amount),
        currency,
        stripe_payment_intent_id: paymentIntent.id,
        status:                   'pending',
        language:                 language === 'en' ? 'en' : 'es',
        coupon_code:              couponCode ?? null,
        discount_amount:          discountAmount ?? 0,
        original_amount:          originalAmount ?? null,
      }).select('id').single()

      if (orderError) {
        console.error('Order insert error:', orderError.message)
      } else if (orderData?.id && couponCode) {
        // Best-effort backfill of coupon_usage.order_id
        const { error: backfillErr } = await supabase
          .from('coupon_usage')
          .update({ order_id: orderData.id })
          .eq('email', contact.email.toLowerCase())
          .is('order_id', null)
          .order('applied_at', { ascending: false })
          .limit(1)
        if (backfillErr) console.warn('Coupon usage backfill error:', backfillErr.message)
      }
    }

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const fullError = err instanceof Error ? JSON.stringify({ message: err.message, name: err.name, stack: err.stack }, null, 2) : String(err)
    console.error('Full error:', fullError)
    return new Response(
      JSON.stringify({ error: message, details: fullError }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
