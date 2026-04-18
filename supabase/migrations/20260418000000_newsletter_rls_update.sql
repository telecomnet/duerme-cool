-- ══════════════════════════════════════════════════════════════════════════════
-- FIX: Add UPDATE policy to newsletter_subscribers for upsert operations
-- ══════════════════════════════════════════════════════════════════════════════

-- Allow public UPDATE on newsletter_subscribers so upsert operations work
drop policy if exists "newsletter_public_update" on public.newsletter_subscribers;
create policy "newsletter_public_update" on public.newsletter_subscribers
  for update with check (true);
