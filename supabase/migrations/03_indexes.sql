-- =====================================================
-- CampFlow PMS - Database Indexes
-- =====================================================
-- File: 03_indexes.sql
-- Purpose: Performance optimization indexes
-- Execution Order: 3rd (after tables)
-- Performance Targets: Availability query <100ms, Dashboard <200ms
-- =====================================================

-- =====================================================
-- GIST INDEXES for Range Queries
-- =====================================================

-- GIST index on booking_period for efficient range queries
-- Critical for availability searches and conflict detection
CREATE INDEX IF NOT EXISTS idx_bookings_period ON bookings USING GIST (booking_period);

-- =====================================================
-- B-TREE INDEXES for Common Queries
-- =====================================================

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_pitch_id ON bookings (pitch_id) 
  WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings (customer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- Composite index for today's arrivals/departures queries
-- Used by dashboard stats API
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings (
  (lower(booking_period)::date),
  (upper(booking_period)::date)
) WHERE status IN ('confirmed', 'checked_in');

-- Pitches indexes
CREATE INDEX IF NOT EXISTS idx_pitches_type ON pitches (type);

CREATE INDEX IF NOT EXISTS idx_pitches_status ON pitches (status);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);

-- Booking guests indexes
CREATE INDEX IF NOT EXISTS idx_booking_guests_booking ON booking_guests(booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_guests_type ON booking_guests(guest_type);

-- =====================================================
-- Index Analysis
-- =====================================================
-- Run these queries to analyze index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
--
-- Check index size:
-- SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid))
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public';
