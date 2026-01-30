-- ============================================
-- FIX: Move btree_gist Extension to Dedicated Schema
-- ============================================
-- Date: 2026-01-30
-- Purpose: Move btree_gist extension from public schema to extensions schema
--          to follow PostgreSQL best practices and resolve Supabase linter warning
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public
-- ============================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop the extension from public schema
DROP EXTENSION IF EXISTS btree_gist CASCADE;

-- Recreate the extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;

-- Grant usage on the extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- ============================================
-- IMPORTANT: Recreate the anti-overbooking constraint
-- ============================================
-- Since we dropped the extension with CASCADE, we need to recreate
-- the GIST exclusion constraint on the bookings table

ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS prevent_overbooking;

ALTER TABLE public.bookings 
ADD CONSTRAINT prevent_overbooking 
EXCLUDE USING GIST (
  pitch_id WITH =,
  booking_period WITH &&
) WHERE (status NOT IN ('cancelled', 'checked_out'));

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the extension is now in the extensions schema:
-- 
-- SELECT 
--   e.extname AS extension_name,
--   n.nspname AS schema_name
-- FROM pg_extension e
-- JOIN pg_namespace n ON e.extnamespace = n.oid
-- WHERE e.extname = 'btree_gist';
--
-- Expected result: btree_gist should be in 'extensions' schema, not 'public'
