-- ============================================
-- FIX: Function Search Path Security
-- ============================================
-- Date: 2026-01-30
-- Purpose: Add explicit search_path to all functions to prevent
--          potential SQL injection via search_path manipulation
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
-- ============================================

-- 1. Fix update_updated_at_column (Trigger Function)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 2. Fix count_arrivals_today
-- ============================================
CREATE OR REPLACE FUNCTION count_arrivals_today(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.bookings
        WHERE lower(booking_period) = target_date
        AND status IN ('confirmed', 'checked_in')
    );
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- 3. Fix count_departures_today
-- ============================================
CREATE OR REPLACE FUNCTION count_departures_today(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.bookings
        WHERE upper(booking_period) = target_date
        AND status IN ('checked_in', 'checked_out')
    );
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- 4. Fix get_current_occupancy
-- ============================================
CREATE OR REPLACE FUNCTION get_current_occupancy(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.bookings
        WHERE booking_period @> target_date
        AND status IN ('confirmed', 'checked_in')
    );
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- 5. Fix get_dashboard_stats
-- ============================================
-- Drop first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_dashboard_stats(DATE);

CREATE OR REPLACE FUNCTION get_dashboard_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  arrivals_today INTEGER,
  departures_today INTEGER,
  current_occupancy INTEGER,
  total_pitches INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER 
     FROM public.bookings 
     WHERE lower(booking_period) = target_date 
     AND status IN ('confirmed', 'checked_in')) AS arrivals_today,
    
    (SELECT COUNT(*)::INTEGER 
     FROM public.bookings 
     WHERE upper(booking_period) = target_date 
     AND status IN ('checked_in', 'checked_out')) AS departures_today,
    
    (SELECT COUNT(*)::INTEGER 
     FROM public.bookings 
     WHERE booking_period @> target_date 
     AND status IN ('confirmed', 'checked_in')) AS current_occupancy,
    
    (SELECT COUNT(*)::INTEGER 
     FROM public.pitches) AS total_pitches;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- 6. Fix get_db_stats
-- ============================================
-- Drop first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_db_stats();

CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS TABLE (
  total_bookings BIGINT,
  total_customers BIGINT,
  total_pitches BIGINT,
  total_guests BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.bookings) AS total_bookings,
    (SELECT COUNT(*) FROM public.customers) AS total_customers,
    (SELECT COUNT(*) FROM public.pitches) AS total_pitches,
    (SELECT COUNT(*) FROM public.booking_guests) AS total_guests;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- 7. Fix get_price_for_date
-- ============================================
-- Drop first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_price_for_date(DATE);

CREATE OR REPLACE FUNCTION get_price_for_date(search_date DATE)
RETURNS TABLE (
  season_id UUID,
  season_name VARCHAR,
  piazzola_price DECIMAL,
  tenda_price DECIMAL,
  person_price DECIMAL,
  child_price DECIMAL,
  dog_price DECIMAL,
  car_price DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.name,
    ps.piazzola_price_per_day,
    ps.tenda_price_per_day,
    ps.person_price_per_day,
    ps.child_price_per_day,
    ps.dog_price_per_day,
    ps.car_price_per_day
  FROM public.pricing_seasons ps
  WHERE ps.is_active = true
    AND search_date >= ps.start_date
    AND search_date <= ps.end_date
  ORDER BY ps.priority DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all functions now have search_path set:
-- 
-- SELECT 
--   n.nspname as schema,
--   p.proname as function_name,
--   pg_get_function_result(p.oid) as result_type,
--   CASE 
--     WHEN p.prosecdef THEN 'SECURITY DEFINER'
--     ELSE 'SECURITY INVOKER'
--   END as security,
--   COALESCE(
--     (SELECT setting 
--      FROM unnest(p.proconfig) setting 
--      WHERE setting LIKE 'search_path=%'), 
--     'NOT SET'
--   ) as search_path_setting
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
--   AND p.proname IN (
--     'update_updated_at_column',
--     'count_arrivals_today',
--     'count_departures_today',
--     'get_current_occupancy',
--     'get_dashboard_stats',
--     'get_db_stats',
--     'get_price_for_date'
--   )
-- ORDER BY p.proname;
