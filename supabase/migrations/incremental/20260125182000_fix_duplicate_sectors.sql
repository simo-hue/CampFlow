-- 1. Deduplicate sectors
DO $$
DECLARE
    r RECORD;
    winner_id UUID;
BEGIN
    -- Loop through all sector names that have duplicates
    FOR r IN SELECT name FROM sectors GROUP BY name HAVING COUNT(*) > 1 LOOP
        -- Pick the winner (e.g., the first one created)
        SELECT id INTO winner_id 
        FROM sectors 
        WHERE name = r.name 
        ORDER BY created_at ASC, id ASC 
        LIMIT 1;

        -- Update pitches to point to the winner
        UPDATE pitches
        SET sector_id = winner_id
        WHERE sector_id IN (
            SELECT id::text FROM sectors WHERE name = r.name AND id != winner_id
        );

        -- Delete the losers
        DELETE FROM sectors
        WHERE name = r.name AND id != winner_id;
    END LOOP;
END $$;

-- 2. Add Unique Constraint
ALTER TABLE sectors ADD CONSTRAINT sectors_name_key UNIQUE (name);
