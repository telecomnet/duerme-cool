-- The previous migration revoked EXECUTE from the `anon` role specifically,
-- but is_admin() and current_customer_id() were created with the default
-- Postgres behavior of also granting EXECUTE to the PUBLIC pseudo-role
-- (every function gets this unless explicitly revoked). PUBLIC grants apply
-- to every role including anon, so the anon-specific revoke alone didn't
-- actually change anything — anon was still inheriting EXECUTE via PUBLIC.
-- This revokes the PUBLIC grant too. `authenticated` keeps access because it
-- has its own explicit grant, separate from the PUBLIC entry.
revoke execute on function public.is_admin() from public;
revoke execute on function public.current_customer_id() from public;
