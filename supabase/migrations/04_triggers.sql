-- =====================================================
-- CampFlow PMS - Database Triggers
-- =====================================================
-- File: 04_triggers.sql
-- Purpose: Automatic timestamp updates and business logic
-- Execution Order: 4th (after indexes)
-- =====================================================

-- =====================================================
-- FUNCTION: Update timestamp automatically
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at column on row modification';

-- =====================================================
-- TRIGGERS: Apply timestamp update to all tables
-- =====================================================

-- Pitches table trigger
DROP TRIGGER IF EXISTS update_pitches_updated_at ON pitches;
CREATE TRIGGER update_pitches_updated_at 
  BEFORE UPDATE ON pitches 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Customers table trigger
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Bookings table trigger
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Booking guests table trigger
DROP TRIGGER IF EXISTS update_booking_guests_updated_at ON booking_guests;
CREATE TRIGGER update_booking_guests_updated_at 
  BEFORE UPDATE ON booking_guests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify triggers are created:
-- SELECT tgname, tgrelid::regclass, tgtype, tgenabled 
-- FROM pg_trigger 
-- WHERE tgname LIKE 'update_%_updated_at';
