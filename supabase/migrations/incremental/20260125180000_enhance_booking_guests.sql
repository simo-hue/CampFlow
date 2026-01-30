-- =====================================================
-- CampFlow PMS - Migration
-- File: 20260125180000_enhance_booking_guests.sql
-- Purpose: Enhance booking_guests for detailed check-in
-- =====================================================

-- 1. Add structured columns to booking_guests
ALTER TABLE booking_guests
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('M', 'F', 'OTHER')),
ADD COLUMN IF NOT EXISTS citizenship VARCHAR(100),
ADD COLUMN IF NOT EXISTS birth_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS birth_province VARCHAR(100),
ADD COLUMN IF NOT EXISTS birth_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_head_of_family BOOLEAN DEFAULT FALSE;

-- 2. Migrate existing full_name data to first_name (best effort)
-- We'll just put the whole string in first_name for old records if they exist,
-- or leave them to be fixed manually. The new check-in flow will mandate structured data.
UPDATE booking_guests
SET first_name = full_name
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- 3. Make full_name optional (or keep it as a computed/legacy field).
-- For now, we drop the NOT NULL constraint on full_name.
ALTER TABLE booking_guests ALTER COLUMN full_name DROP NOT NULL;

-- 4. Add index for faster lookups if needed (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_booking_guests_booking_id ON booking_guests(booking_id);

COMMENT ON COLUMN booking_guests.is_head_of_family IS 'Flag to identify the primary guest (capo famiglia) who provides full data';
