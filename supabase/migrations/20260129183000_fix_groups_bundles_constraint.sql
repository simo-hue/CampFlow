-- Drop the old unique constraint which didn't include season_id
ALTER TABLE group_bundles
DROP CONSTRAINT IF EXISTS unique_group_bundle_nights;

-- Add new unique constraint including season_id
-- This allows having a 3-night bundle in Low Season AND a 3-night bundle in High Season for the same group
ALTER TABLE group_bundles
ADD CONSTRAINT unique_group_bundle_season_nights UNIQUE (group_id, season_id, nights);
