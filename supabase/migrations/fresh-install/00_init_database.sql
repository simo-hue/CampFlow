-- =====================================================
-- CampFlow Database Setup - Complete Initialization
-- =====================================================
-- Version: 1.0
-- Date: 2026-01-30
-- Purpose: Single-file database initialization for fresh Supabase projects
-- 
-- USAGE:
-- 1. Create a new Supabase project
-- 2. Open SQL Editor in Supabase Dashboard
-- 3. Copy and execute this entire file
-- 4. Verify with the queries at the end
-- =====================================================

-- =====================================================
-- STEP 1: EXTENSIONS
-- =====================================================

-- Create dedicated schema for extensions (best practice)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;

GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- =====================================================
-- STEP 2: CORE TABLES
-- =====================================================

-- Sectors (campground organization)
CREATE TABLE IF NOT EXISTS public.sectors (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pitches (campsite spots)
CREATE TABLE IF NOT EXISTS public.pitches (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  number VARCHAR(10) NOT NULL,
  suffix VARCHAR(1) NOT NULL DEFAULT '' CHECK (suffix IN ('', 'a', 'b')),
  type VARCHAR(50) NOT NULL CHECK (type IN ('piazzola', 'tenda')),
  attributes JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pitches_number_suffix_key UNIQUE (number, suffix)
);

-- Customer Groups (for pricing tiers)
CREATE TABLE IF NOT EXISTS public.customer_groups (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  notes TEXT,
  group_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing Seasons
CREATE TABLE IF NOT EXISTS public.pricing_seasons (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  piazzola_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tenda_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
  person_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
  child_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
  dog_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
  car_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(20) DEFAULT '#94a3b8',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings (reservations)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_period DATERANGE NOT NULL,
  guests_count INTEGER NOT NULL CHECK (guests_count > 0),
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed' 
    CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Guests (individual guest details for check-in)
CREATE TABLE IF NOT EXISTS public.booking_guests (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  birth_place VARCHAR(255),
  address TEXT,
  document_type VARCHAR(50),
  document_number VARCHAR(100),
  document_issue_date DATE,
  document_issuer VARCHAR(255),
  document_issue_place VARCHAR(255),
  nationality VARCHAR(100),
  gender VARCHAR(20),
  residence_city VARCHAR(255),
  residence_province VARCHAR(10),
  residence_country VARCHAR(100),
  residence_zip VARCHAR(20),
  birth_city VARCHAR(255),
  birth_province VARCHAR(10),
  birth_country VARCHAR(100),
  license_plate VARCHAR(50),
  questura_status VARCHAR(50) DEFAULT 'pending' CHECK (questura_status IN ('pending', 'sent', 'confirmed', 'failed')),
  guest_type VARCHAR(20) NOT NULL DEFAULT 'adult' 
    CHECK (guest_type IN ('adult', 'child', 'infant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Group Season Configuration (custom pricing per group+season)
CREATE TABLE IF NOT EXISTS public.group_season_configuration (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES pricing_seasons(id) ON DELETE CASCADE,
  discount_percentage DECIMAL(5, 2),
  custom_rates JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_group_season_config UNIQUE (group_id, season_id)
);

-- Group Bundles (package pricing)
CREATE TABLE IF NOT EXISTS public.group_bundles (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES pricing_seasons(id) ON DELETE CASCADE,
  nights INTEGER NOT NULL CHECK (nights > 0),
  pitch_price DECIMAL(10, 2) NOT NULL,
  unit_prices JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_group_bundle_config UNIQUE (group_id, season_id, nights)
);

-- System Logs (for monitoring)
CREATE TABLE IF NOT EXISTS public.app_logs (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  level VARCHAR(10) NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- STEP 3: INDEXES FOR PERFORMANCE
-- =====================================================

-- Pitches
CREATE INDEX IF NOT EXISTS idx_pitches_type ON pitches (type);
CREATE INDEX IF NOT EXISTS idx_pitches_status ON pitches (status);
CREATE INDEX IF NOT EXISTS idx_pitches_sector ON pitches (sector_id);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_group_id ON customers(group_id);

-- Bookings (GIST for range queries)
CREATE INDEX IF NOT EXISTS idx_bookings_period ON bookings USING GIST (booking_period);
CREATE INDEX IF NOT EXISTS idx_bookings_pitch_id ON bookings (pitch_id) WHERE status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings (
  (lower(booking_period)::date),
  (upper(booking_period)::date)
) WHERE status IN ('confirmed', 'checked_in');

-- Booking Guests
CREATE INDEX IF NOT EXISTS idx_booking_guests_booking ON booking_guests(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_guests_type ON booking_guests(guest_type);

-- App Logs
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON app_logs(created_at DESC);

-- =====================================================
-- STEP 4: ANTI-OVERBOOKING CONSTRAINT
-- =====================================================

-- Prevent double-booking using GIST exclusion constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS prevent_overbooking;

ALTER TABLE bookings 
ADD CONSTRAINT prevent_overbooking 
EXCLUDE USING GIST (
  pitch_id WITH =,
  booking_period WITH &&
) WHERE (status NOT IN ('cancelled', 'checked_out'));

-- =====================================================
-- STEP 5: TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE TRIGGER update_pitches_updated_at 
  BEFORE UPDATE ON pitches 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_guests_updated_at 
  BEFORE UPDATE ON booking_guests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_seasons_updated_at
  BEFORE UPDATE ON pricing_seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_groups_updated_at
  BEFORE UPDATE ON customer_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_season_config_updated_at
  BEFORE UPDATE ON group_season_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: DASHBOARD & STATISTICS FUNCTIONS
-- =====================================================

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

DROP FUNCTION IF EXISTS get_dashboard_stats(DATE);
CREATE FUNCTION get_dashboard_stats(target_date DATE DEFAULT CURRENT_DATE)
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

DROP FUNCTION IF EXISTS get_db_stats();
CREATE FUNCTION get_db_stats()
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

DROP FUNCTION IF EXISTS get_price_for_date(DATE);
CREATE FUNCTION get_price_for_date(search_date DATE)
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

-- =====================================================
-- STEP 7: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_season_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users have full access (single-user model)
CREATE POLICY "Authenticated users have full access to pitches"
ON public.pitches FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to bookings"
ON public.bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to sectors"
ON public.sectors FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to pricing_seasons"
ON public.pricing_seasons FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to customers"
ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to booking_guests"
ON public.booking_guests FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to customer_groups"
ON public.customer_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to group_season_configuration"
ON public.group_season_configuration FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to group_bundles"
ON public.group_bundles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to app_logs"
ON public.app_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 8: SEED DATA (OPTIONAL - RECOMMENDED FOR TESTING)
-- =====================================================

-- Default Pricing Season
INSERT INTO pricing_seasons (name, description, start_date, end_date, piazzola_price_per_day, tenda_price_per_day, person_price_per_day, child_price_per_day, dog_price_per_day, car_price_per_day, priority, color)
VALUES ('Stagione Base (Default)', 'Prezzi di default per periodi non coperti da altre stagioni', '2024-01-01', '2024-12-31', 10.00, 8.00, 5.00, 3.00, 2.00, 3.00, 0, '#94a3b8')
ON CONFLICT DO NOTHING;

-- Sample Sectors
INSERT INTO sectors (name) VALUES 
('Settore 1'),
('Settore 2'),
('Settore 3'),
('Settore 4')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the installation:

-- 1. Check all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check functions have search_path security
SELECT 
  p.proname as function_name,
  COALESCE(
    (SELECT setting 
     FROM unnest(p.proconfig) setting 
     WHERE setting LIKE 'search_path=%'), 
    'NOT SET'
  ) as search_path_setting
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- 4. Check extension location
SELECT 
  e.extname AS extension_name,
  n.nspname AS schema_name
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname IN ('uuid-ossp', 'btree_gist');

-- 5. Check anti-overbooking constraint
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conname = 'prevent_overbooking';

-- =====================================================
-- SETUP COMPLETE! 
-- =====================================================
-- Next steps:
-- 1. Configure Supabase Authentication (enable Email provider)
-- 2. Set environment variables in your application:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY
-- 3. (Optional) Run seed data migrations for test bookings
-- =====================================================
