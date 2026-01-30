-- =====================================================
-- CampFlow PMS - Complete Database Schema
-- =====================================================
-- Property Management System for 300-pitch Campsite
-- 
-- IMPORTANT: This file is a complete reference schema.
-- For modular execution, use the files in migrations/ folder:
--   1. migrations/01_extensions.sql
--   2. migrations/02_tables.sql
--   3. migrations/03_indexes.sql
--   4. migrations/04_triggers.sql
--   5. migrations/05_functions.sql
--   6. migrations/06_seed_data.sql
--   7. migrations/07_rls.sql
-- 
-- See migrations/README.md for execution instructions
-- =====================================================


-- Enable required extensions
-- Note: btree_gist should be installed in 'extensions' schema (see fix_extension_schema.sql)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;

-- =====================================================
-- TABLE: sectors
-- Logical grouping of pitches (e.g. "Settore 1", "Near Lake")
-- =====================================================
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: pitches
-- Stores information about each campsite pitch
-- Supports single pitches (suffix='') and split pitches (suffix='a'/'b')
-- =====================================================
CREATE TABLE pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL, -- Link to sector
  number VARCHAR(10) NOT NULL, -- Base number e.g. "001", "102"
  suffix VARCHAR(1) NOT NULL DEFAULT '' CHECK (suffix IN ('', 'a', 'b')),
  type VARCHAR(50) NOT NULL CHECK (type IN ('piazzola', 'tenda')),
  attributes JSONB NOT NULL DEFAULT '{}', 
  -- Attributes removed from UI as per simplification (2026-01-18)
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint on number + suffix combination
  CONSTRAINT pitches_number_suffix_key UNIQUE (number, suffix)
);


-- =====================================================
-- TABLE: customers
-- Stores customer information
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: bookings
-- Stores reservations using TSRANGE for date periods
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Date range usando DATERANGE (solo date, senza ore)
  booking_period DATERANGE NOT NULL,
  
  guests_count INTEGER NOT NULL CHECK (guests_count > 0),
  total_price DECIMAL(10, 2) NOT NULL,
  
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed' 
    CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint anti-overbooking usando GIST con DATERANGE
-- Previene prenotazioni sovrapposte sulla stessa piazzola
-- Esclude anche 'checked_out' per liberare la piazzola dopo il check-out
ALTER TABLE bookings 
ADD CONSTRAINT prevent_overbooking 
EXCLUDE USING GIST (
  pitch_id WITH =,
  booking_period WITH &&
) WHERE (status NOT IN ('cancelled', 'checked_out'));

-- =====================================================
-- TABLE: booking_guests
-- Individual guest details (filled during check-in)
-- =====================================================
CREATE TABLE booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Dati anagrafici persona
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  birth_place VARCHAR(255),
  address TEXT,
  
  -- Documento identità
  document_type VARCHAR(50), -- carta_identita, passaporto, patente, etc
  document_number VARCHAR(100),
  nationality VARCHAR(100),
  
  -- Tipo ospite
  guest_type VARCHAR(20) NOT NULL DEFAULT 'adult' 
    CHECK (guest_type IN ('adult', 'child', 'infant')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per booking_guests
CREATE INDEX idx_booking_guests_booking ON booking_guests(booking_id);
CREATE INDEX idx_booking_guests_type ON booking_guests(guest_type);

-- =====================================================
-- INDEXES for Performance Optimization
-- =====================================================

-- GIST index on booking_period for efficient range queries
CREATE INDEX idx_bookings_period ON bookings USING GIST (booking_period);

-- B-tree indexes for common queries
CREATE INDEX idx_bookings_pitch_id ON bookings (pitch_id) WHERE status != 'cancelled';
CREATE INDEX idx_bookings_customer_id ON bookings (customer_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_pitches_type ON pitches (type);
CREATE INDEX idx_pitches_status ON pitches (status);
CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_customers_email ON customers (email);

-- Composite index for today's arrivals/departures queries
CREATE INDEX idx_bookings_dates ON bookings (
  (lower(booking_period)::date),
  (upper(booking_period)::date)
) WHERE status IN ('confirmed', 'checked_in');

-- =====================================================
-- TRIGGER: Update timestamps automatically
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

-- =====================================================
-- SEED DATA: Sample Pitches
-- =====================================================
INSERT INTO pitches (number, suffix, type, attributes) VALUES
  -- Piazzole (1-100)
  ('001', '', 'piazzola', '{}'),
  ('002', '', 'piazzola', '{}'),
  ('003', '', 'piazzola', '{}'),
  ('004', '', 'piazzola', '{}'),
  ('005', '', 'piazzola', '{}'),
  
  -- Tende (101-200)
  ('101', '', 'tenda', '{}'),
  ('102', '', 'tenda', '{}'),
  ('103', '', 'tenda', '{}'),
  ('104', '', 'tenda', '{}'),
  ('105', '', 'tenda', '{}'),
  
  -- Altre Piazzole (201-300)
  ('201', '', 'piazzola', '{}'),
  ('202', '', 'piazzola', '{}'),
  ('203', '', 'piazzola', '{}'),
  ('204', '', 'piazzola', '{}'),
  ('205', '', 'piazzola', '{}');

-- NOTE: In production, you'll need to insert all 300 pitches.
-- Use a script or generate them programmatically.

-- =====================================================
-- FUNCTIONS for Dashboard Statistics
-- =====================================================

-- Funzione per contare arrivi di oggi
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

-- Funzione per contare partenze di oggi
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

COMMENT ON TABLE pitches IS 'Campsite pitches with JSONB attributes for flexibility';
COMMENT ON TABLE customers IS 'Customer records for reservation management';
COMMENT ON TABLE bookings IS 'Reservations using DATERANGE with anti-overbooking constraint';
COMMENT ON TABLE booking_guests IS 'Individual guest details recorded during check-in';
COMMENT ON COLUMN bookings.booking_period IS 'DATERANGE type ensures efficient date range queries and prevents overlaps via GIST exclusion';
COMMENT ON CONSTRAINT prevent_overbooking ON bookings IS 'GIST exclusion constraint that physically prevents double-booking at database level';
COMMENT ON TABLE sectors IS 'Campground sectors for pitch organization';

-- =====================================================
-- TABLE: pricing_seasons
-- Stores seasonal pricing configurations
-- =====================================================
CREATE TABLE pricing_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TRIGGER update_pricing_seasons_updated_at
  BEFORE UPDATE ON pricing_seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Sectors & Organization
-- =====================================================

-- 1. Create Sectors
INSERT INTO sectors (name) VALUES 
('Settore 1'),
('Settore 2'),
('Settore 3'),
('Settore 4')
ON CONFLICT (name) DO NOTHING;

-- 2. Organize Pitches into Sectors
DO $$
DECLARE
    id_S1 uuid;
    id_S2 uuid;
    id_S3 uuid;
    id_S4 uuid;
BEGIN
    -- Retrieve IDs
    SELECT id INTO id_S1 FROM sectors WHERE name = 'Settore 1' LIMIT 1;
    SELECT id INTO id_S2 FROM sectors WHERE name = 'Settore 2' LIMIT 1;
    SELECT id INTO id_S3 FROM sectors WHERE name = 'Settore 3' LIMIT 1;
    SELECT id INTO id_S4 FROM sectors WHERE name = 'Settore 4' LIMIT 1;

    -- Range 1: 1-25 -> Settore 1
    UPDATE pitches 
    SET sector_id = id_S1 
    WHERE type = 'piazzola' 
    AND (NULLIF(regexp_replace(number, '\D', '', 'g'), '')::int) BETWEEN 1 AND 25;

    -- Range 2: 26-50 -> Settore 2
    UPDATE pitches 
    SET sector_id = id_S2 
    WHERE type = 'piazzola' 
    AND (NULLIF(regexp_replace(number, '\D', '', 'g'), '')::int) BETWEEN 26 AND 50;

    -- Range 3: 51-100 (extended to 101 in req, but typically pitches go to 100) -> Settore 3
    UPDATE pitches 
    SET sector_id = id_S3 
    WHERE type = 'piazzola' 
    AND (NULLIF(regexp_replace(number, '\D', '', 'g'), '')::int) BETWEEN 51 AND 101;

    -- Range 4: 102+ -> Settore 4
    UPDATE pitches 
    SET sector_id = id_S4 
    WHERE type = 'piazzola' 
    AND (NULLIF(regexp_replace(number, '\D', '', 'g'), '')::int) >= 102;

    -- Tents have NULL sector
    UPDATE pitches
    SET sector_id = NULL
    WHERE type = 'tenda';
END $$;
-- =====================================================
-- MIGRATION: Customer Groups & Seasonal Discounts
-- =====================================================

-- 1. Create customer_groups table
CREATE TABLE IF NOT EXISTS customer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3b82f6', -- Default blue
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at in customer_groups
CREATE TRIGGER update_customer_groups_updated_at
  BEFORE UPDATE ON customer_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Add group_id to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_customers_group_id ON customers(group_id);

-- 3. Create group_season_configuration table
-- This table links a specific Group to a specific Season to define custom pricing rules.
CREATE TABLE IF NOT EXISTS group_season_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES pricing_seasons(id) ON DELETE CASCADE,
  
  -- Option A: Percentage Discount (e.g., 10.00 for 10%)
  discount_percentage DECIMAL(5, 2),
  
  -- Option B: Custom Flat Rates (overrides standard season rates if present)
  -- stored as JSON: { "person": 5.00, "dog": 0.00, "car": 2.50 }
  custom_rates JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique configuration per group+season
  CONSTRAINT unique_group_season_config UNIQUE (group_id, season_id)
);

-- Trigger for updated_at in group_season_configuration
CREATE TRIGGER update_group_season_config_updated_at
  BEFORE UPDATE ON group_season_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS (Row Level Security) - Authenticated users only
ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_season_configuration ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users only (secure single-user setup)
CREATE POLICY "Authenticated users have full access to customer_groups"
ON customer_groups
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to group_season_configuration"
ON group_season_configuration
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
