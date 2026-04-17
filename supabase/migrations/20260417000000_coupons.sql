-- ══════════════════════════════════════════════════════════════════════════════
-- MODULE: Coupons — coupon system with atomic validation via RPC
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Coupons table ──────────────────────────────────────────────────────────
create table if not exists public.coupons (
  id                   uuid        default gen_random_uuid() primary key,
  code                 text        not null unique,
  description          text,
  discount_type        text        not null check (discount_type in ('percentage', 'fixed')),
  discount_value       integer     not null check (discount_value > 0),
  minimum_order_amount integer     not null default 0,
  target_email         text,
  max_uses             integer,
  uses_count           integer     not null default 0,
  is_active            boolean     not null default true,
  expires_at           timestamptz,
  created_at           timestamptz not null default now(),
  created_by           uuid        references auth.users(id) on delete set null
);

-- ── 2. Coupon usage table ─────────────────────────────────────────────────────
create table if not exists public.coupon_usage (
  id          uuid        default gen_random_uuid() primary key,
  coupon_id   uuid        not null references public.coupons(id) on delete cascade,
  email       text        not null,
  order_id    uuid        references public.orders(id) on delete set null,
  applied_at  timestamptz not null default now()
);

-- ── 3. Add coupon columns to orders table ─────────────────────────────────────
alter table public.orders
  add column if not exists coupon_code       text,
  add column if not exists discount_amount   integer not null default 0,
  add column if not exists original_amount   integer;

-- ── 4. Indexes ────────────────────────────────────────────────────────────────
create index if not exists idx_coupons_code         on public.coupons(upper(code));
create index if not exists idx_coupons_active       on public.coupons(is_active) where is_active = true;
create index if not exists idx_coupon_usage_coupon  on public.coupon_usage(coupon_id);
create index if not exists idx_coupon_usage_email   on public.coupon_usage(email);

-- ── 5. RLS ────────────────────────────────────────────────────────────────────
alter table public.coupons       enable row level security;
alter table public.coupon_usage  enable row level security;

drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin());

drop policy if exists "coupon_usage_admin_select" on public.coupon_usage;
create policy "coupon_usage_admin_select" on public.coupon_usage
  for select using (public.is_admin());

-- ── 6. Atomic validate-and-increment RPC ────────────────────────────────────
-- Uses FOR UPDATE to lock the row so concurrent calls queue up
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

-- Grant execute to anon role so edge functions can call it
grant execute on function public.validate_and_apply_coupon to anon, authenticated;
