-- =====================================================
-- DIAGNOSTIC (READ-ONLY): orphaned customers
-- =====================================================
-- Ref: CODEBASE_ANALYSIS.md § H-1  (audit found 890 / 1720 with no bookings)
--
-- The code fix (compensating rollback in POST /api/bookings) stops NEW orphans.
-- These queries help you decide what to do with the EXISTING ones. They do NOT
-- delete anything. Some orphans may be legitimate (walk-ins / registry-only
-- customers added without a booking), so review before any cleanup.
-- =====================================================

-- 1) How many orphans, and how old are they?
SELECT
  COUNT(*)                                   AS orphan_customers,
  MIN(created_at)                            AS oldest,
  MAX(created_at)                            AS newest,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS created_last_30d
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = c.id);

-- 2) Sample of 50 orphans (eyeball whether they look like real registry entries
--    vs. junk from failed bookings — e.g. missing email/notes, generic names).
SELECT id, first_name, last_name, phone, email, group_id, created_at
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = c.id)
ORDER BY created_at DESC
LIMIT 50;

-- 3) (OPTIONAL — DESTRUCTIVE, commented out on purpose) If, after review, you
--    want to remove orphaned customers created before a cutoff date, uncomment
--    and adjust the date. KEEP IT COMMENTED unless you are sure.
--
-- DELETE FROM customers c
-- WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = c.id)
--   AND created_at < '2026-01-01';
