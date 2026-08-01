-- ══════════════════════════════════════════════════════════════════════════════
-- MODULE: Harden anon access to auth-primitive functions
--
-- is_admin() and current_customer_id() only ever read the CALLING role's own
-- JWT (auth.jwt() / auth.email()), so an anon caller gets a harmless
-- false/null — there's no data leak today. But per the monthly security
-- review, anon shouldn't be able to invoke authorization primitives at all,
-- as a defense-in-depth measure (e.g. against future changes to these
-- functions that might not preserve that property).
--
-- Verified safe before applying: every RLS policy that references these
-- functions (orders_select_own, customers_select_own, order_items_select_own,
-- shipping_select_own, tracking_select_own, dc_device_state_read,
-- dc_devices_read, *_admin_all) is only ever exercised by logged-in
-- (authenticated) sessions in this codebase — src/pages/Dashboard.tsx and
-- src/pages/AdminDashboard.tsx, both behind ProtectedRoute/AdminRoute, which
-- require a real user session. No anon-facing page queries these tables
-- directly; checkout and telemetry writes go through edge functions using
-- the service-role key, which bypasses grants entirely and is unaffected.
--
-- validate_and_apply_coupon() / preview_coupon() are intentionally left
-- grantable to anon — guest checkout has no login, and those functions only
-- ever operate on the code/email/amount passed in, not on caller identity.
-- ══════════════════════════════════════════════════════════════════════════════

revoke execute on function public.is_admin() from anon;
revoke execute on function public.current_customer_id() from anon;
