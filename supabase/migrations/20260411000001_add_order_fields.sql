-- ── Add order_number, tracking_token, language to orders ─────────────────────

alter table public.orders
  add column if not exists order_number  text unique,
  add column if not exists tracking_token uuid not null default gen_random_uuid() unique,
  add column if not exists language       text not null default 'es';

-- Sequential, human-readable order number: DM-001000, DM-001001, …
create sequence if not exists public.order_number_seq start 1000;

create or replace function public.generate_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null then
    new.order_number := 'DM-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger set_order_number
  before insert on public.orders
  for each row
  execute function public.generate_order_number();
