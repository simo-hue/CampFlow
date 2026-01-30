-- Add season_id to group_bundles to enable season-specific bundles
ALTER TABLE group_bundles 
ADD COLUMN season_id UUID REFERENCES pricing_seasons(id) ON DELETE CASCADE;

-- Update RLS or constraints if necessary
-- For now, just adding the column.
