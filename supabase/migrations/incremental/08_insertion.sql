DO $$
DECLARE
  i INTEGER;
BEGIN
  -- =====================================================
  -- TENDE (12 totali): T001 - T012
  -- =====================================================
  FOR i IN 1..12 LOOP
    INSERT INTO pitches (number, suffix, type, attributes)
    VALUES ('T' || LPAD(i::TEXT, 3, '0'), '', 'tenda', '{}')
    ON CONFLICT (number, suffix) DO NOTHING;
  END LOOP;

  -- =====================================================
  -- PIAZZOLE - Settore 1: 001-025 (25 piazzole)
  -- =====================================================
  FOR i IN 1..25 LOOP
    INSERT INTO pitches (number, suffix, type, attributes)
    VALUES (LPAD(i::TEXT, 3, '0'), '', 'piazzola', '{}')
    ON CONFLICT (number, suffix) DO NOTHING;
  END LOOP;

  -- =====================================================
  -- PIAZZOLE - Settore 2: 026-050 (25 piazzole)
  -- =====================================================
  FOR i IN 26..50 LOOP
    INSERT INTO pitches (number, suffix, type, attributes)
    VALUES (LPAD(i::TEXT, 3, '0'), '', 'piazzola', '{}')
    ON CONFLICT (number, suffix) DO NOTHING;
  END LOOP;

  -- =====================================================
  -- PIAZZOLE - Settore 3: 051-101 (51 piazzole)
  -- =====================================================
  FOR i IN 51..101 LOOP
    INSERT INTO pitches (number, suffix, type, attributes)
    VALUES (LPAD(i::TEXT, 3, '0'), '', 'piazzola', '{}')
    ON CONFLICT (number, suffix) DO NOTHING;
  END LOOP;

  -- =====================================================
  -- PIAZZOLE - Settore 4: 102-112 (11 piazzole)
  -- =====================================================
  FOR i IN 102..112 LOOP
    INSERT INTO pitches (number, suffix, type, attributes)
    VALUES (LPAD(i::TEXT, 3, '0'), '', 'piazzola', '{}')
    ON CONFLICT (number, suffix) DO NOTHING;
  END LOOP;
  
END $$;

-- Verifica risultato
SELECT 
  type,
  COUNT(*) as totale,
  MIN(number) as prima,
  MAX(number) as ultima
FROM pitches 
GROUP BY type 
ORDER BY type;

-- Output atteso:
-- piazzola | 112 | 001 | 112
-- tenda    | 12  | T001 | T012