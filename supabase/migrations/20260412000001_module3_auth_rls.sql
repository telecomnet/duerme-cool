-- ══════════════════════════════════════════════════════════════════════════════
-- MÓDULO 3 — Autenticación: RLS policies + admin role helpers
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Helper: verificar si el JWT tiene rol de administrador ────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    ''
  ) = 'admin'
$$;

-- ── Helper: obtener el customer_id del usuario autenticado ────────────────────
create or replace function public.current_customer_id()
returns uuid language sql stable security definer as $$
  select id from public.customers where email = auth.email()
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- POLÍTICAS RLS
-- (drop-if-exists para idempotencia en re-runs)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── customers ─────────────────────────────────────────────────────────────────
drop policy if exists "customers_select_own"  on public.customers;
drop policy if exists "customers_update_own"  on public.customers;
drop policy if exists "customers_admin_all"   on public.customers;

create policy "customers_select_own" on public.customers
  for select using (email = auth.email() or public.is_admin());

create policy "customers_update_own" on public.customers
  for update using (email = auth.email());

create policy "customers_admin_all" on public.customers
  for all using (public.is_admin());

-- ── orders ────────────────────────────────────────────────────────────────────
drop policy if exists "orders_select_own"   on public.orders;
drop policy if exists "orders_admin_all"    on public.orders;

create policy "orders_select_own" on public.orders
  for select using (
    customer_id = public.current_customer_id()
    or public.is_admin()
  );

create policy "orders_admin_all" on public.orders
  for all using (public.is_admin());

-- ── order_items ───────────────────────────────────────────────────────────────
drop policy if exists "order_items_select_own"  on public.order_items;
drop policy if exists "order_items_admin_all"   on public.order_items;

create policy "order_items_select_own" on public.order_items
  for select using (
    order_id in (
      select id from public.orders
      where customer_id = public.current_customer_id()
    )
    or public.is_admin()
  );

create policy "order_items_admin_all" on public.order_items
  for all using (public.is_admin());

-- ── shipping_addresses ────────────────────────────────────────────────────────
drop policy if exists "shipping_select_own"   on public.shipping_addresses;
drop policy if exists "shipping_admin_all"    on public.shipping_addresses;

create policy "shipping_select_own" on public.shipping_addresses
  for select using (
    order_id in (
      select id from public.orders
      where customer_id = public.current_customer_id()
    )
    or public.is_admin()
  );

create policy "shipping_admin_all" on public.shipping_addresses
  for all using (public.is_admin());

-- ── tracking ──────────────────────────────────────────────────────────────────
drop policy if exists "tracking_select_own"     on public.tracking;
drop policy if exists "tracking_insert_admin"   on public.tracking;
drop policy if exists "tracking_update_admin"   on public.tracking;

create policy "tracking_select_own" on public.tracking
  for select using (
    order_id in (
      select id from public.orders
      where customer_id = public.current_customer_id()
    )
    or public.is_admin()
  );

create policy "tracking_insert_admin" on public.tracking
  for insert with check (public.is_admin());

create policy "tracking_update_admin" on public.tracking
  for update using (public.is_admin());

-- ── newsletter_subscribers ────────────────────────────────────────────────────
drop policy if exists "newsletter_admin_only" on public.newsletter_subscribers;

create policy "newsletter_admin_only" on public.newsletter_subscribers
  for all using (public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- CONFIGURACIÓN DEL SMTP DE SUPABASE AUTH
-- Hacer en: Dashboard → Project Settings → Authentication → SMTP
-- Host: smtp.gmail.com  Port: 587  User: duermecool@gmail.com
-- From: Duerme.cool <duermecool@gmail.com>
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Promover usuario a administrador (ejecutar manualmente cuando se necesite) ─
-- update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
--   where email = 'admin@duerme.cool';
