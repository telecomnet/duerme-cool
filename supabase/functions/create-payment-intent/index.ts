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

const ALLOWED_CURRENCY = 'mxn'

interface IncomingItem {
  id?: string
  quantity?: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      currency,
      contact,
      shipping,
      items,
      language,
      couponCode = null,
      // `amount`, `discountAmount` and `originalAmount` sent by the client are
      // intentionally ignored below — trusting them let anyone intercept the
      // request and pay whatever they wanted. The real amount is recomputed
      // here from the `products` table and, if a coupon is present, from
      // validate_and_apply_coupon().
    } = await req.json()

    if (!currency || String(currency).toLowerCase() !== ALLOWED_CURRENCY) {
      throw new Error('Missing or unsupported currency')
    }
    if (!contact?.email) throw new Error('Missing required field: contact.email')
    if (!Array.isArray(items) || items.length === 0) throw new Error('Cart is empty')

    // ── 1. Recompute the subtotal server-side from the products table ────────
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, size, price, is_active')
      .eq('is_active', true)

    if (productsError) throw new Error(`Failed to load product prices: ${productsError.message}`)

    const priceById = new Map((products ?? []).map((p) => [p.id, p]))

    const validatedItems = (items as IncomingItem[]).map((item) => {
      const product = item.id ? priceById.get(item.id) : undefined
      const quantity = Number(item.quantity)
      if (!product) throw new Error(`Unknown or inactive product: ${item.id}`)
      if (!Number.isInteger(quantity) || quantity <= 0) throw new Error(`Invalid quantity for ${item.id}`)
      return { id: product.id, size: product.size, price: product.price, quantity }
    })

    const subtotal = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // ── 2. Re-validate the coupon server-side — this call is the one that
    //       actually consumes a redemption (increments uses_count) ───────────
    let finalAmount: number = subtotal
    let discountAmount = 0
    let originalAmount: number | null = null
    let appliedCouponId: string | null = null

    if (couponCode) {
      const { data: couponResult, error: couponRpcError } = await supabase.rpc('validate_and_apply_coupon', {
        p_code:   String(couponCode).trim().toUpperCase(),
        p_email:  String(contact.email).trim().toLowerCase(),
        p_amount: subtotal,
      })

      if (couponRpcError) throw new Error(`Coupon validation failed: ${couponRpcError.message}`)

      const result = couponResult?.[0]
      if (!result?.valid) {
        return new Response(
          JSON.stringify({ error: 'invalid_coupon', couponError: result?.error_code ?? 'unknown' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
      }

      finalAmount     = result.final_amount
      discountAmount  = result.discount_amount
      originalAmount  = subtotal
      appliedCouponId = result.coupon_id
    }

    // ── 3. Upsert customer (email is the unique key) ─────────────────────────
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

    // ── 4. Create Stripe PaymentIntent for the server-computed amount ────────
    // Note: Prices include IVA 16% (inclusive tax). Stripe will show the full amount.
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount:   Math.round(finalAmount),
        currency: ALLOWED_CURRENCY,
        payment_method_types: ['card'],
        receipt_email: contact.email,
        metadata: {
          customer_id: customer?.id ?? '',
          phone:       contact.phone     ?? '',
          newsletter:  String(contact.newsletter ?? false),
          full_name:   shipping.fullName ?? '',
          address:     `${shipping.addressLine1}, ${shipping.city}, ${shipping.state} ${shipping.zip}`,
          items:       JSON.stringify(validatedItems),
          coupon_code: couponCode ?? '',
          discount_amount: String(discountAmount ?? 0),
        },
      })
    } catch (stripeErr) {
      console.error('Stripe PaymentIntent error:', stripeErr)
      throw stripeErr
    }

    // ── 5. Create order record with the same server-computed values ─────────
    if (customer?.id) {
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        customer_id:              customer.id,
        items:                    validatedItems,
        total_amount:             Math.round(finalAmount),
        currency:                 ALLOWED_CURRENCY,
        stripe_payment_intent_id: paymentIntent.id,
        status:                   'pending',
        language:                 language === 'en' ? 'en' : 'es',
        coupon_code:              couponCode ?? null,
        discount_amount:          discountAmount ?? 0,
        original_amount:          originalAmount,
      }).select('id').single()

      if (orderError) {
        console.error('Order insert error:', orderError.message)
      } else if (orderData?.id && appliedCouponId) {
        const { error: usageErr } = await supabase.from('coupon_usage').insert({
          coupon_id: appliedCouponId,
          email:     String(contact.email).trim().toLowerCase(),
          order_id:  orderData.id,
        })
        if (usageErr) console.warn('Coupon usage insert error:', usageErr.message)
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
