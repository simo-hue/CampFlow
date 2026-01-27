-- =====================================================
-- CampFlow PMS - Optimized Dashboard Stats
-- =====================================================
-- File: 20260120113000_optimize_dashboard_stats.sql
-- Purpose: Consolidate dashboard stats into a single fast query
-- =====================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    arrivals_today BIGINT,
    departures_today BIGINT,
    current_occupancy BIGINT,
    total_pitches BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH 
    -- 1. Arrivals: Check-ins today
    stats_arrivals AS (
        SELECT COUNT(*) as count
        FROM bookings
        WHERE lower(booking_period) = target_date
        AND status IN ('confirmed', 'checked_in')
    ),
    
    -- 2. Departures: Check-outs today
    stats_departures AS (
        SELECT COUNT(*) as count
        FROM bookings
        WHERE upper(booking_period) = target_date
        AND status IN ('checked_in', 'checked_out')
    ),
    
    -- 3. Occupancy: Active bookings covering the target date
    -- Logic: booking_period CONTAINS target_date
    -- Correctly uses range operator @> which handles inclusive/exclusive bounds
    stats_occupancy AS (
        SELECT COUNT(*) as count
        FROM bookings
        WHERE booking_period @> target_date
        AND status IN ('confirmed', 'checked_in')
    ),
    
    -- 4. Total Pitches: All non-deleted/non-maintenance pitches
    stats_pitches AS (
        SELECT COUNT(*) as count
        FROM pitches
        WHERE status IN ('available', 'maintenance', 'blocked') -- Include all physical pitches
    )
    
    SELECT 
        (SELECT count FROM stats_arrivals) as arrivals_today,
        (SELECT count FROM stats_departures) as departures_today,
        (SELECT count FROM stats_occupancy) as current_occupancy,
        (SELECT count FROM stats_pitches) as total_pitches;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_dashboard_stats(DATE) IS 'Returns aggregated dashboard statistics in a single query for performance';
