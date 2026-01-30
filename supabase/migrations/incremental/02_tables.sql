-- =====================================================
-- CampFlow PMS - Table Definitions
-- =====================================================
-- File: 02_tables.sql
-- Purpose: Create all database tables with constraints
-- Execution Order: 2nd (after extensions)
-- =====================================================

-- =====================================================
-- TABLE: pitches
-- Stores information about each campsite pitch
-- Supports single pitches (suffix='') and split pitches (suffix='a'/'b')
-- =====================================================
CREATE TABLE IF NOT EXISTS pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(10) NOT NULL, -- Base number e.g. "001", "102"
  suffix VARCHAR(1) NOT NULL DEFAULT '' CHECK (suffix IN ('', 'a', 'b')),
  type VARCHAR(50) NOT NULL CHECK (type IN ('piazzola', 'tenda')),
  attributes JSONB NOT NULL DEFAULT '{}', 
  -- Attributes removed from UI as per simplification (2026-01-18)
  -- Available attributes: shade, electricity, water, sewer, size_sqm
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint on number + suffix combination
  CONSTRAINT pitches_number_suffix_key UNIQUE (number, suffix)
);

COMMENT ON TABLE pitches IS 'Campsite pitches with JSONB attributes for flexibility';
COMMENT ON COLUMN pitches.number IS 'Base pitch number, e.g. 001, 102';
COMMENT ON COLUMN pitches.suffix IS 'Empty string for single pitch, a/b for split pitches';
COMMENT ON COLUMN pitches.type IS 'piazzola (caravan/camper) or tenda (tent)';
COMMENT ON COLUMN pitches.attributes IS 'Flexible JSONB for pitch features (shade, electricity, water, sewer, size_sqm)';

-- =====================================================
-- TABLE: customers
-- Stores customer information
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE customers IS 'Customer records for reservation management';
COMMENT ON COLUMN customers.phone IS 'Required field for customer identification';
COMMENT ON COLUMN customers.email IS 'Optional email for communications';

-- =====================================================
-- TABLE: bookings
-- Stores reservations using DATERANGE for date periods
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Date range using DATERANGE (dates only, no time)
  booking_period DATERANGE NOT NULL,
  
  guests_count INTEGER NOT NULL CHECK (guests_count > 0),
  total_price DECIMAL(10, 2) NOT NULL,
  
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed' 
    CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bookings IS 'Reservations using DATERANGE with anti-overbooking constraint';
COMMENT ON COLUMN bookings.booking_period IS 'DATERANGE type ensures efficient date range queries and prevents overlaps via GIST exclusion';
COMMENT ON COLUMN bookings.status IS 'confirmed → checked_in → checked_out | cancelled (terminal state)';

-- =====================================================
-- CONSTRAINT: Anti-Overbooking using GIST Exclusion
-- Prevents overlapping bookings on the same pitch
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'prevent_overbooking'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT prevent_overbooking 
    EXCLUDE USING GIST (
      pitch_id WITH =,
      booking_period WITH &&
    ) WHERE (status NOT IN ('cancelled'));
  END IF;
END $$;

COMMENT ON CONSTRAINT prevent_overbooking ON bookings IS 'GIST exclusion constraint that physically prevents double-booking at database level';

-- =====================================================
-- TABLE: booking_guests
-- Individual guest details (filled during check-in)
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Personal data
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  birth_place VARCHAR(255),
  address TEXT,
  
  -- Identity document
  document_type VARCHAR(50), -- carta_identita, passaporto, patente, etc
  document_number VARCHAR(100),
  nationality VARCHAR(100),
  
  -- Guest type
  guest_type VARCHAR(20) NOT NULL DEFAULT 'adult' 
    CHECK (guest_type IN ('adult', 'child', 'infant')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE booking_guests IS 'Individual guest details recorded during check-in';
COMMENT ON COLUMN booking_guests.guest_type IS 'adult (>12 years), child (3-12), infant (<3)';
COMMENT ON COLUMN booking_guests.document_type IS 'carta_identita, passaporto, patente, etc.';

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify table creation:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT conname, contype FROM pg_constraint WHERE conrelid = 'bookings'::regclass;
