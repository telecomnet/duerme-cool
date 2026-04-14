-- ══════════════════════════════════════════════════════════════════════════════
-- MÓDULO 2 — Esquema completo de base de datos
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Actualizar tabla customers ─────────────────────────────────────────────
alter table public.customers
  add column if not exists email_verified     boolean not null default false,
  add column if not exists preferred_language text    not null default 'es'
    check (preferred_language in ('es', 'en')),
  add column if not exists newsletter_opt_in  boolean not null default false;

-- Back-fill newsletter_opt_in from the existing newsletter column
update public.customers
  set newsletter_opt_in = newsletter
  where newsletter_opt_in = false and newsletter = true;

-- ── 2. Actualizar tabla orders ────────────────────────────────────────────────
alter table public.orders
  add column if not exists stripe_order_id text;

-- Rename total_amount → total for cleaner naming (keep old col as alias view later)
-- We add a generated alias so existing code keeps working without changes.
alter table public.orders
  add column if not exists total integer
    generated always as (total_amount) stored;

-- ── 3. Crear tabla order_items ────────────────────────────────────────────────
create table if not exists public.order_items (
  id           uuid        default gen_random_uuid() primary key,
  order_id     uuid        not null references public.orders(id) on delete cascade,
  product_name text        not null,
  quantity     integer     not null check (quantity > 0),
  unit_price   integer     not null,   -- in cents
  subtotal     integer     not null,   -- in cents (quantity × unit_price)
  created_at   timestamptz not null default now()
);

-- ── 4. Crear tabla shipping_addresses ────────────────────────────────────────
create table if not exists public.shipping_addresses (
  id              uuid        default gen_random_uuid() primary key,
  order_id        uuid        not null references public.orders(id) on delete cascade,
  nombre_completo text        not null,
  calle           text        not null,
  colonia         text,
  ciudad          text        not null,
  estado          text        not null,
  cp              text        not null,
  pais            text        not null default 'MX',
  telefono        text,
  created_at      timestamptz not null default now()
);

-- ── 5. Crear tabla tracking ───────────────────────────────────────────────────
create table if not exists public.tracking (
  id              uuid        default gen_random_uuid() primary key,
  order_id        uuid        not null references public.orders(id) on delete cascade,
  tracking_number text        not null,
  carrier         text        not null,
  tracking_url    text,
  added_by_admin  uuid        references auth.users(id) on delete set null,
  added_at        timestamptz not null default now(),
  notes           text
);

-- ── 6. Crear tabla newsletter_subscribers ────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id                 uuid        default gen_random_uuid() primary key,
  email              text        not null unique,
  name               text,
  confirmed          boolean     not null default false,
  confirmation_token text        unique default encode(extensions.gen_random_bytes(32), 'hex'),
  subscribed_at      timestamptz not null default now(),
  preferred_language text        not null default 'es'
    check (preferred_language in ('es', 'en'))
);

-- ── 7. Índices ────────────────────────────────────────────────────────────────
create index if not exists idx_order_items_order_id        on public.order_items(order_id);
create index if not exists idx_shipping_addresses_order_id on public.shipping_addresses(order_id);
create index if not exists idx_tracking_order_id           on public.tracking(order_id);
create index if not exists idx_tracking_number             on public.tracking(tracking_number);
create index if not exists idx_newsletter_email            on public.newsletter_subscribers(email);
create index if not exists idx_newsletter_token            on public.newsletter_subscribers(confirmation_token);

-- ── 8. auto-update updated_at en orders (ya existe el trigger, sólo confirmamos) ──
-- El trigger orders_updated_at fue creado en la migración 000000. No se duplica.

-- ── 9. RLS en tablas nuevas ───────────────────────────────────────────────────
alter table public.order_items            enable row level security;
alter table public.shipping_addresses     enable row level security;
alter table public.tracking               enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Sin políticas públicas: todo el acceso es vía service_role key en Edge Functions.
-- Agregar políticas aquí cuando se construya el portal de cliente autenticado:
--
-- Ejemplo para que un cliente vea sus propias órdenes (requiere auth):
-- create policy "customers_own_orders" on public.orders
--   for select using (
--     customer_id = (
--       select id from public.customers where email = auth.email()
--     )
--   );
