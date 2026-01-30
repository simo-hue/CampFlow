-- ============================================================================
-- DATABASE PERFORMANCE OPTIMIZATION - PART 2 (VACUUM Maintenance)
-- ============================================================================
-- Date: 2026-01-30
-- Objective: Clear dead rows and update table statistics
-- Impact: Reclaim disk space and improve query planner decisions
-- 
-- IMPORTANT: Execute this file AFTER optimize_database_performance.sql
-- 
-- EXECUTION INSTRUCTIONS:
-- This file MUST be run directly via psql or Supabase CLI, NOT in SQL Editor
-- The SQL Editor wraps queries in transactions, but VACUUM cannot run in a transaction
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Database Maintenance - Clear Dead Rows
-- ----------------------------------------------------------------------------
-- Problem: High percentage of dead rows:
--   - bookings: 17.6% (51/289)
--   - pitches: 45% (56/124)
--   - customers: 48% (25/52)
-- Impact: Improves query performance and reclaims disk space
-- ----------------------------------------------------------------------------

-- Option 1: Run these commands ONE AT A TIME in Supabase SQL Editor:
-- (Copy and paste each command separately and execute)

-- VACUUM ANALYZE public.bookings;
-- VACUUM ANALYZE public.pitches;
-- VACUUM ANALYZE public.customers;
-- VACUUM ANALYZE public.booking_guests;


-- Option 2: Use Supabase CLI (Recommended for automation)
-- supabase db execute --file supabase/migrations/optimize_database_vacuum.sql


-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this AFTER vacuum to verify dead rows reduction (target: < 5%)
SELECT 
  schemaname,
  relname,
  n_live_tup,
  n_dead_tup,
  round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname IN ('bookings', 'pitches', 'customers', 'booking_guests')
ORDER BY dead_pct DESC NULLS LAST;
