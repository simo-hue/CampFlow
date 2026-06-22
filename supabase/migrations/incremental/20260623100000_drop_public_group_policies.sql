-- =====================================================
-- FIX C-3: Remove over-permissive {public} RLS policies
-- =====================================================
-- Date: 2026-06-23
-- Ref:  CODEBASE_ANALYSIS.md § C-3
--
-- PROBLEM:
--   Three tables carry an "Enable all access for all users" policy
--   targeting the `public` role (which includes `anon`). Because the
--   anon key is shipped in the browser bundle and the Supabase REST
--   endpoint is internet-reachable, ANYONE can currently read, rewrite
--   or delete pricing bundles / group configs directly.
--
-- WHY THIS IS SAFE TO RUN ON LIVE DATA:
--   - It only DROPS policies; it does not touch any row.
--   - The application accesses these tables exclusively through API
--     routes that use the SERVICE ROLE key (which bypasses RLS), e.g.
--     /api/groups, /api/groups/[id], and the pricing calc in
--     /api/bookings. So the app keeps working unchanged.
--   - After this, the tables are deny-by-default for anon/authenticated,
--     which is the intended posture.
-- =====================================================

DROP POLICY IF EXISTS "Enable all access for all users" ON public.customer_groups;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.group_bundles;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.group_season_configuration;

-- =====================================================
-- VERIFICATION (run after the DROPs; paste the output back)
-- Expect: NO rows where roles contains 'public' for these 3 tables.
-- The remaining {authenticated} policies (if any) are fine — the app
-- does not rely on them, but they are harmless.
-- =====================================================
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('customer_groups', 'group_bundles', 'group_season_configuration')
ORDER BY tablename, policyname;
