-- 1. Creiamo i settori necessari (se non esistono)
INSERT INTO sectors (name) VALUES ('Settore 1') ON CONFLICT DO NOTHING;
INSERT INTO sectors (name) VALUES ('Settore 2') ON CONFLICT DO NOTHING;
INSERT INTO sectors (name) VALUES ('Settore 3') ON CONFLICT DO NOTHING;
INSERT INTO sectors (name) VALUES ('Settore 4') ON CONFLICT DO NOTHING;

-- 2. Funzione di utilità per aggiornare i range
DO $$
DECLARE
    id_S1 uuid;
    id_S2 uuid;
    id_S3 uuid;
    id_S4 uuid;
BEGIN
    -- Recuperiamo gli ID dei settori appena creati/esistenti
    SELECT id INTO id_S1 FROM sectors WHERE name = 'Settore 1' LIMIT 1;
    SELECT id INTO id_S2 FROM sectors WHERE name = 'Settore 2' LIMIT 1;
    SELECT id INTO id_S3 FROM sectors WHERE name = 'Settore 3' LIMIT 1;
    SELECT id INTO id_S4 FROM sectors WHERE name = 'Settore 4' LIMIT 1;

    -- Range 1: 1-25 -> Settore 1
    UPDATE pitches 
    SET sector_id = id_S1 
    WHERE type = 'piazzola' 
    AND (NULLIF(regexp_replace(number, '\D', '', 'g'), '')::int) BETWEEN 1 AND 25;

    -- Range 2: 26-50 -> Settore 2
    UPDATE pitches 
    SET sector_id = id_S2 
    WHERE type = 'piazzola' 
    AND (NULLIF(regexp_replace(number, '\D', '', 'g'), '')::int) BETWEEN 26 AND 50;

    -- Range 3: 51-101 -> Settore 3
    UPDATE pitches 
    SET sector_id = id_S3 
    WHERE type = 'piazzola' 
    AND (NULLIF(regexp_replace(number, '\D', '', 'g'), '')::int) BETWEEN 51 AND 101;

    -- Range 4: 102-112 -> Settore 4
    UPDATE pitches 
    SET sector_id = id_S4 
    WHERE type = 'piazzola' 
    AND (NULLIF(regexp_replace(number, '\D', '', 'g'), '')::int) BETWEEN 102 AND 112;

    -- 3. Assicuriamoci che le Tende NON abbiano un settore
    UPDATE pitches
    SET sector_id = NULL
    WHERE type = 'tenda';

    RAISE NOTICE 'Organizzazione settori completata.';
END $$;

-- 4. Verifica finale
SELECT s.name, COUNT(p.id) as pitches_count
FROM sectors s
LEFT JOIN pitches p ON p.sector_id::text = s.id::text
GROUP BY s.name
ORDER BY s.name;
