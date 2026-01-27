-- =====================================================
-- CampFlow PMS - Database Functions
-- =====================================================
-- File: 05_functions.sql
-- Purpose: Reusable SQL functions for dashboard and reports
-- Execution Order: 5th (after triggers)
-- =====================================================

-- =====================================================
-- FUNCTION: Count arrivals for a specific date
-- Used by: /api/stats endpoint for dashboard statistics
-- =====================================================
CREATE OR REPLACE FUNCTION count_arrivals_today(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM bookings
        WHERE lower(booking_period) = target_date
        AND status IN ('confirmed', 'checked_in')
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION count_arrivals_today(DATE) IS 'Counts bookings arriving on the specified date';

-- =====================================================
-- FUNCTION: Count departures for a specific date
-- Used by: /api/stats endpoint for dashboard statistics
-- =====================================================
CREATE OR REPLACE FUNCTION count_departures_today(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM bookings
        WHERE upper(booking_period) = target_date
        AND status IN ('checked_in', 'checked_out')
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION count_departures_today(DATE) IS 'Counts bookings departing on the specified date';

-- =====================================================
-- FUNCTION: Get current occupancy count
-- Used by: /api/stats endpoint for dashboard statistics
-- =====================================================
CREATE OR REPLACE FUNCTION get_current_occupancy(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM bookings
        WHERE booking_period @> target_date
        AND status IN ('confirmed', 'checked_in')
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_current_occupancy(DATE) IS 'Counts pitches occupied on the specified date';

-- =====================================================
-- FUTURE FUNCTIONS (Placeholder)
-- =====================================================
-- These functions are planned for future implementation:
--
-- CREATE FUNCTION calculate_seasonal_price(...)
--   Calculate price based on date ranges (high/medium/low season)
--   Currently implemented in TypeScript at lib/pricing.ts
--
-- CREATE FUNCTION get_monthly_occupancy_report(...)
--   Generate monthly occupancy statistics for reporting
--
-- CREATE FUNCTION export_istat_data(...)
--   Export guest data in ISTAT format for Italian authorities
--

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to test the functions:
-- SELECT count_arrivals_today(CURRENT_DATE);
-- SELECT count_departures_today(CURRENT_DATE);
-- SELECT get_current_occupancy(CURRENT_DATE);
