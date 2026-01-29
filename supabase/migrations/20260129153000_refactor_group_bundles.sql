-- Rename price to pitch_price
ALTER TABLE group_bundles RENAME COLUMN price TO pitch_price;

-- Add unit_prices column
ALTER TABLE group_bundles ADD COLUMN unit_prices JSONB DEFAULT '{}'::jsonb;

-- Remove included_services column (legacy)
ALTER TABLE group_bundles DROP COLUMN included_services;
