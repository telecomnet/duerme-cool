-- ══════════════════════════════════════════════════════════════════════════════
-- MODULE: Secure checkout pricing
--
-- Problem: create-payment-intent trusted the client-sent `amount` /
-- `discountAmount` for the actual Stripe charge. Anyone intercepting the
-- checkout request (devtools, a proxy) could set any amount they wanted,
-- with or without a real coupon. This migration adds the server-side source
-- of truth the edge function needs so it never has to trust the browser:
--   1. A `products` table with the real prices (mirrors src/components/Shop.tsx).
--   2. A non-consuming coupon preview function, so the "apply coupon" UI step
--      can show a discount without burning a redemption — the real,
--      consuming validation (validate_and_apply_coupon) now runs exactly
--      once, at the moment the charge is actually created.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Canonical product prices ────────────────────────────────────────────────
create table if not exists public.products (
  id         text        primary key,
  size       text        not null,
  price      integer     not null check (price > 0), -- cents (MXN), IVA included
  currency   text        not null default 'mxn',
  is_active  boolean     not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.products (id, size, price) values
  ('full',  'Full',  21990),
  ('queen', 'Queen', 22990),
  ('king',  'King',  23990)
on conflict (id) do update set
  size  = excluded.size,
  price = excluded.price;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
  for all using (public.is_admin());

drop policy if exists "products_public_select" on public.products;
create policy "products_public_select" on public.products
  for select using (is_active);

-- ── 2. Non-consuming coupon preview ────────────────────────────────────────────
-- Identical rules to validate_and_apply_coupon, minus the row lock and minus
-- the uses_count increment. Used only to show the discount in the UI.
create or replace function public.preview_coupon(
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
language plpgsql security definer
set search_path to 'public' as $$
declare
  v_coupon public.coupons%rowtype;
  v_discount_amount integer;
begin
  select * into v_coupon
    from public.coupons
    where upper(code) = upper(p_code);

  if not found then
    return query select false, 'code_not_found'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  if not v_coupon.is_active then
    return query select false, 'inactive'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
    return query select false, 'expired'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  if v_coupon.max_uses is not null and v_coupon.uses_count >= v_coupon.max_uses then
    return query select false, 'used_up'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  if v_coupon.target_email is not null
     and lower(v_coupon.target_email) <> lower(p_email) then
    return query select false, 'not_eligible'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  if p_amount < v_coupon.minimum_order_amount then
    return query select false, 'below_minimum'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

  if v_coupon.discount_type = 'percentage' then
    v_discount_amount := round((p_amount::numeric * v_coupon.discount_value / 100))::integer;
  else
    v_discount_amount := least(v_coupon.discount_value, p_amount);
  end if;

  if (p_amount - v_discount_amount) < 1000 then
    return query select false, 'exceeds_max_discount'::text,
      null::uuid, null::text, null::integer, 0, p_amount;
    return;
  end if;

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

grant execute on function public.preview_coupon to anon, authenticated;
