-- ── Module 6: Newsletter — RLS Policies ───────────────────────────────────────────

-- Allow public INSERT for newsletter subscriptions (handled by newsletter-subscribe Edge Function)
drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert with check (true);

-- Note: Both newsletter-subscribe and newsletter-confirm Edge Functions use SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses all RLS policies. These policies are for documentation and future direct-client reads.
-- The existing newsletter_admin_only policy (for all using is_admin()) remains in effect for admin dashboard access.
