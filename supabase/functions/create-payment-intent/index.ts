import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'
import { corsHeaders } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
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
    const { amount, currency, contact, shipping, items, language } = await req.json()

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
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: contact.email,
      metadata: {
        customer_id: customer?.id ?? '',
        phone:       contact.phone     ?? '',
        newsletter:  String(contact.newsletter ?? false),
        full_name:   shipping.fullName ?? '',
        address:     `${shipping.addressLine1}, ${shipping.city}, ${shipping.state} ${shipping.zip}`,
        items:       JSON.stringify(items ?? []),
        tax_behavior: 'inclusive',  // Prices include tax (16% IVA)
      },
    })

    // ── 3. Create order record ───────────────────────────────────────────────
    if (customer?.id) {
      const { error: orderError } = await supabase.from('orders').insert({
        customer_id:              customer.id,
        items:                    items ?? [],
        total_amount:             Math.round(amount),
        currency,
        stripe_payment_intent_id: paymentIntent.id,
        status:                   'pending',
        language:                 language === 'en' ? 'en' : 'es',
      })
      if (orderError) console.error('Order insert error:', orderError.message)
    }

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
