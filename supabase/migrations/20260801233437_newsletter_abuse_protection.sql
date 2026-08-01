-- ══════════════════════════════════════════════════════════════════════════════
-- MODULE: Newsletter signup abuse protection
--
-- newsletter_subscribers allows unrestricted public INSERT (intentional — the
-- signup form has no login) and newsletter-subscribe immediately emails a
-- "confirm your subscription" message to whatever address is submitted. That
-- combination lets someone use the form to email-bomb a third party's inbox
-- by resubmitting their address repeatedly, or script it to hit many victim
-- addresses from one place. This adds the log table the edge function uses
-- to throttle: at most one confirmation email per address per cooldown
-- window, and a cap on how many confirmation emails one source IP can
-- trigger per hour. Combined with a honeypot field on the frontend form.
-- ══════════════════════════════════════════════════════════════════════════════

create table if not exists public.newsletter_send_log (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null,
  ip         text        not null,
  created_at timestamptz not null default now()
);

-- Service-role only — the edge function is the sole reader/writer.
alter table public.newsletter_send_log enable row level security;

create index if not exists idx_newsletter_send_log_email_created
  on public.newsletter_send_log (email, created_at);
create index if not exists idx_newsletter_send_log_ip_created
  on public.newsletter_send_log (ip, created_at);

-- Short retention — only recent rows are needed for rate limiting.
select cron.schedule(
  'newsletter_send_log_retention_2d',
  '45 3 * * *',
  $$delete from public.newsletter_send_log where created_at < now() - interval '2 days'$$
);
