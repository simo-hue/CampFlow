-- Clean up archived seasons (previously soft-deleted)
DELETE FROM pricing_seasons
WHERE is_active = false;
