-- Add is_recurring column to pricing_seasons
ALTER TABLE pricing_seasons 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT true;

COMMENT ON COLUMN pricing_seasons.is_recurring IS 'If true, the year is ignored and the season repeats annually based on month and day';

-- Update existing seasons to be recurring by default
UPDATE pricing_seasons SET is_recurring = true WHERE is_recurring IS NULL;
