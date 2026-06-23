-- =====================================================
-- FIX B1: drop dead/broken log functions
-- =====================================================
-- Date: 2026-06-23
-- Ref:  CODEBASE_ANALYSIS.md (H-2 follow-up) / schema regen notes
--
-- cleanup_old_logs() and get_recent_logs() reference app_logs columns that no
-- longer exist (created_at / metadata — the table uses `timestamp` / `meta`),
-- so they error if ever called. They are unused by the app (the sys-monitor
-- log purge/read paths query app_logs directly via the service role).
--
-- SAFE: drops two unused functions; no table or row is touched.
-- =====================================================

DROP FUNCTION IF EXISTS public.cleanup_old_logs(integer);
DROP FUNCTION IF EXISTS public.get_recent_logs(integer, text);

-- =====================================================
-- VERIFICATION (expect 0 rows)
-- =====================================================
SELECT proname
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('cleanup_old_logs', 'get_recent_logs');
