-- =====================================================
-- CampFlow PMS - Database Schema
-- Property Management System for 300-pitch Campsite
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =====================================================
-- TABLE: pitches
-- Stores information about each campsite pitch
-- =====================================================
CREATE TABLE pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(10) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('standard', 'comfort', 'premium')),
  attributes JSONB NOT NULL DEFAULT '{}', 
  -- Example attributes: {"shade": true, "electricity": true, "water": true, "size_sqm": 80}
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
ALTER TABLE bookings 
ADD CONSTRAINT prevent_overbooking 
EXCLUDE USING GIST (
  pitch_id WITH =,
  booking_period WITH &&
) WHERE (status NOT IN ('cancelled'));

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
$$ language 'plpgsql';

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

-- =====================================================
-- SEED DATA: Sample Pitches
-- =====================================================
INSERT INTO pitches (number, type, attributes) VALUES
  -- Standard pitches (1-100)
  ('001', 'standard', '{"shade": true, "electricity": true, "water": false, "size_sqm": 60}'),
  ('002', 'standard', '{"shade": false, "electricity": true, "water": false, "size_sqm": 60}'),
  ('003', 'standard', '{"shade": true, "electricity": true, "water": false, "size_sqm": 60}'),
  ('004', 'standard', '{"shade": false, "electricity": true, "water": false, "size_sqm": 60}'),
  ('005', 'standard', '{"shade": true, "electricity": true, "water": false, "size_sqm": 60}'),
  
  -- Comfort pitches (101-200)
  ('101', 'comfort', '{"shade": true, "electricity": true, "water": true, "size_sqm": 80}'),
  ('102', 'comfort', '{"shade": true, "electricity": true, "water": true, "size_sqm": 80}'),
  ('103', 'comfort', '{"shade": false, "electricity": true, "water": true, "size_sqm": 80}'),
  ('104', 'comfort', '{"shade": true, "electricity": true, "water": true, "size_sqm": 80}'),
  ('105', 'comfort', '{"shade": true, "electricity": true, "water": true, "size_sqm": 80}'),
  
  -- Premium pitches (201-300)
  ('201', 'premium', '{"shade": true, "electricity": true, "water": true, "size_sqm": 100, "sewer": true}'),
  ('202', 'premium', '{"shade": true, "electricity": true, "water": true, "size_sqm": 100, "sewer": true}'),
  ('203', 'premium', '{"shade": true, "electricity": true, "water": true, "size_sqm": 100, "sewer": true}'),
  ('204', 'premium', '{"shade": false, "electricity": true, "water": true, "size_sqm": 100, "sewer": true}'),
  ('205', 'premium', '{"shade": true, "electricity": true, "water": true, "size_sqm": 100, "sewer": true}');

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
        FROM bookings
        WHERE lower(booking_period) = target_date
        AND status IN ('confirmed', 'checked_in')
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Funzione per contare partenze di oggi
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

COMMENT ON TABLE pitches IS 'Campsite pitches with JSONB attributes for flexibility';
COMMENT ON TABLE customers IS 'Customer records for reservation management';
COMMENT ON TABLE bookings IS 'Reservations using DATERANGE with anti-overbooking constraint';
COMMENT ON COLUMN bookings.booking_period IS 'DATERANGE type ensures efficient date range queries and prevents overlaps via GIST exclusion';
COMMENT ON CONSTRAINT prevent_overbooking ON bookings IS 'GIST exclusion constraint that physically prevents double-booking at database level';
