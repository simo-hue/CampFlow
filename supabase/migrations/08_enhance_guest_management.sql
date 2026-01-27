-- =====================================================
-- CampFlow PMS - Enhanced Guest Management
-- =====================================================
-- File: 08_enhance_guest_management.sql
-- Purpose: Remove full_name, add first/last name, add dogs_count
-- Execution Order: 8th
-- =====================================================

-- =====================================================
-- CUSTOMERS TABLE: Replace full_name with first_name + last_name
-- =====================================================

-- Add new columns
ALTER TABLE customers 
  ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT '';

-- Remove default constraint after adding columns
ALTER TABLE customers 
  ALTER COLUMN first_name DROP DEFAULT,
  ALTER COLUMN last_name DROP DEFAULT;

-- Drop old full_name column (AGGRESSIVE MIGRATION)
ALTER TABLE customers DROP COLUMN full_name;

COMMENT ON COLUMN customers.first_name IS 'Customer first name (required)';
COMMENT ON COLUMN customers.last_name IS 'Customer last name (required)';

-- =====================================================
-- BOOKINGS TABLE: Add dogs_count
-- =====================================================

ALTER TABLE bookings
  ADD COLUMN dogs_count INTEGER NOT NULL DEFAULT 0 
  CHECK (dogs_count >= 0);

COMMENT ON COLUMN bookings.dogs_count IS 'Number of dogs accompanying the guests';

-- =====================================================
-- BOOKING_GUESTS TABLE: Update comments
-- =====================================================

COMMENT ON COLUMN booking_guests.full_name IS 'Full name of individual guest (filled during check-in)';

-- =====================================================
-- Verification Queries
-- =====================================================
-- Verify customers table structure:
-- \d customers
-- 
-- Verify bookings table structure:
-- \d bookings
--
-- Test customer creation:
-- INSERT INTO customers (first_name, last_name, phone) 
-- VALUES ('Mario', 'Rossi', '+39 123 456 789');
