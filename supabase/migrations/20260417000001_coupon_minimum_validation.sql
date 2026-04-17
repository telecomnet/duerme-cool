-- ══════════════════════════════════════════════════════════════════════════════
-- UPDATE: Add Stripe minimum charge validation to validate_and_apply_coupon RPC
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop and recreate the function with minimum charge validation
create or replace function public.validate_and_apply_coupon(
  p_code   text,
  p_email  text,
  p_amount integer
)
returns table (
  valid           boolean,
  error_code      text,
  coupon_id       uuid,
  discount_type   text,
  discount_value  integer,
  discount_amount integer,
  final_amount    integer
)
language plpgsql security definer as $$
declare
  v_coupon public.coupons%rowtype;
  v_discount_amount integer;
begin
  -- Lock the row so concurrent calls queue up
  select * into v_coupon
    from public.coupons
    where upper(code) = upper(p_code)
    for update;

  -- Code not found
  if not found then
    return query select false, 'code_not_found'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  -- Inactive
  if not v_coupon.is_active then
    return query select false, 'inactive'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  -- Expired
  if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
    return query select false, 'expired'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  -- Max uses reached
  if v_coupon.max_uses is not null and v_coupon.uses_count >= v_coupon.max_uses then
    return query select false, 'used_up'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  -- Email targeting
  if v_coupon.target_email is not null
     and lower(v_coupon.target_email) <> lower(p_email) then
    return query select false, 'not_eligible'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  -- Minimum order amount
  if p_amount < v_coupon.minimum_order_amount then
    return query select false, 'below_minimum'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  -- ── Compute discount ────────────────────────────────────────────────────────
  if v_coupon.discount_type = 'percentage' then
    v_discount_amount := round((p_amount::numeric * v_coupon.discount_value / 100))::integer;
  else
    -- fixed
    v_discount_amount := least(v_coupon.discount_value, p_amount);
  end if;

  -- ── Validate final amount meets Stripe minimum ($10 MXN = 1000 cents) ──────
  if (p_amount - v_discount_amount) < 1000 then
    return query select false, 'exceeds_max_discount'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  -- ── Increment uses_count atomically ─────────────────────────────────────────
  update public.coupons
    set uses_count = uses_count + 1
    where id = v_coupon.id;

  -- Return success
  return query select
    true,
    null::text,
    v_coupon.id,
    v_coupon.discount_type,
    v_coupon.discount_value,
    v_discount_amount,
    greatest(p_amount - v_discount_amount, 0);
end;
$$;
