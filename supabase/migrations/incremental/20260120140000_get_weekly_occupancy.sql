-- =====================================================
-- CampFlow PMS - Weekly Occupancy Stats RPC
-- =====================================================
-- File: 20260120140000_get_weekly_occupancy.sql
-- Purpose: Calculate daily occupancy for a specific date range efficiently on the server
-- =====================================================

CREATE OR REPLACE FUNCTION get_weekly_occupancy_stats(start_date DATE, end_date DATE)
RETURNS TABLE (
    day DATE,
    piazzola_count BIGINT,
    tenda_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH dates AS (
        -- Generate series of dates from start to end (inclusive)
        SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS day
    ),
    daily_stats AS (
        SELECT
            d.day,
            -- Count bookings where the day falls within the booking period (occupancy logic)
            -- AND filter by pitch type
            COUNT(b.id) FILTER (WHERE p.type = 'piazzola') as piazzola_count,
            COUNT(b.id) FILTER (WHERE p.type = 'tenda') as tenda_count
        FROM dates d
        -- Join bookings that include this day as an occupied night
        -- Standard DATERANGE '[start, end)' behavior works perfectly here:
        -- The check-in date is INCLUDED
        -- The check-out date is EXCLUDED
        LEFT JOIN bookings b ON b.booking_period @> d.day AND b.status IN ('confirmed', 'checked_in')
        LEFT JOIN pitches p ON b.pitch_id = p.id
        GROUP BY d.day
    )
    SELECT
        ds.day,
        COALESCE(ds.piazzola_count, 0),
        COALESCE(ds.tenda_count, 0)
    FROM daily_stats ds
    ORDER BY ds.day;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_weekly_occupancy_stats(DATE, DATE) IS 'Returns daily occupancy counts for piazzola and tenda within the specified date range';
