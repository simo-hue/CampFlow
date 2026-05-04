-- Migration to add missing columns to the bookings table
-- These columns are needed for accurate seasonal pricing persistence

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS children_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dogs_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cars_count INTEGER DEFAULT 0;

COMMENT ON COLUMN bookings.children_count IS 'Number of children for pricing and statistics';
COMMENT ON COLUMN bookings.dogs_count IS 'Number of dogs for pricing';
COMMENT ON COLUMN bookings.cars_count IS 'Number of cars for pricing';
