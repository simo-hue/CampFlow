-- Migration: Update prevent_overbooking constraint to exclude checked_out status
-- This allows pitches to be freed immediately after check-out
-- Date: 2026-01-23

-- Drop the existing constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS prevent_overbooking;

-- Recreate the constraint with the updated WHERE clause
-- Now excludes both 'cancelled' and 'checked_out' statuses
ALTER TABLE bookings 
ADD CONSTRAINT prevent_overbooking 
EXCLUDE USING GIST (
  pitch_id WITH =,
  booking_period WITH &&
) WHERE (status NOT IN ('cancelled', 'checked_out'));
