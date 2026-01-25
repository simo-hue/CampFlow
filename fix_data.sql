-- 1. Assicuriamoci che esista almeno un settore
INSERT INTO sectors (name)
SELECT 'Settore Principale'
WHERE NOT EXISTS (SELECT 1 FROM sectors);

-- 2. Recuperiamo l'ID del primo settore disponibile
DO $$
DECLARE
    target_sector_id uuid;
BEGIN
    SELECT id INTO target_sector_id FROM sectors LIMIT 1;

    -- 3. Aggiorniamo tutte le piazzole che non hanno ancora un settore
    UPDATE pitches 
    SET sector_id = target_sector_id 
    WHERE sector_id IS NULL;
    
    RAISE NOTICE 'Aggiornate le piazzole con settore ID: %', target_sector_id;
END $$;

-- 4. Verifica finale
SELECT 
    COUNT(*) as total_pitches,
    COUNT(*) FILTER (WHERE sector_id IS NULL) as still_null,
    COUNT(*) FILTER (WHERE sector_id IS NOT NULL) as fixed
FROM pitches;
