-- ── customers ────────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id            uuid        default gen_random_uuid() primary key,
  email         text        not null unique,
  phone         text,
  newsletter    boolean     not null default false,
  full_name     text,
  address_line1 text,
  address_line2 text,
  city          text,
  state         text,
  zip           text,
  country       text        not null default 'MX',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── orders ────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                       uuid        default gen_random_uuid() primary key,
  customer_id              uuid        references public.customers(id) on delete set null,
  items                    jsonb       not null default '[]',
  total_amount             integer     not null,   -- in cents
  currency                 text        not null default 'mxn',
  stripe_payment_intent_id text        unique,
  status                   text        not null default 'pending',
  -- status values: pending | paid | failed | refunded
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ── auto-update updated_at ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
-- All writes go through the Edge Function (service_role key → bypasses RLS).
-- The anon/authenticated roles cannot read customer data from the browser.
alter table public.customers enable row level security;
alter table public.orders     enable row level security;

-- No public policies — access is service_role only.
-- Add policies here later if you need authenticated users to view their own orders:
-- create policy "users see own orders" on public.orders
--   for select using (customer_id = auth.uid());
