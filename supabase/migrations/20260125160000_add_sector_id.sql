-- Add sector_id column to pitches table
ALTER TABLE pitches 
ADD COLUMN sector_id VARCHAR(50);

COMMENT ON COLUMN pitches.sector_id IS 'Optional explicit sector assignment';
