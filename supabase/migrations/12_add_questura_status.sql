-- Add questura_sent status to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS questura_sent BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN bookings.questura_sent IS 'Flag indicating if guest data has been sent to police (Alloggiati Web)';

-- Ensure booking_guests supports all needed fields (already defined in 02_tables.sql but good to double check via migration pattern if needed. 
-- Assuming 02_tables.sql was the base state, we are good. If not, we would add columns here.)
