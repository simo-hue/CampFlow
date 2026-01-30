-- =====================================================
-- CampFlow PMS - Database Extensions
-- =====================================================
-- File: 01_extensions.sql
-- Purpose: Enable required PostgreSQL extensions
-- Execution Order: 1st (must run before table creation)
-- =====================================================

-- UUID generation extension
-- Used for primary keys in all tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- B-tree GIST extension for advanced indexing
-- Required for DATERANGE exclusion constraint (anti-overbooking)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify extensions are installed:
-- SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'btree_gist');
