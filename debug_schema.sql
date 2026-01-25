-- 1. Visualizza tutti i settori disponibili
SELECT * FROM sectors;

-- 2. Statistiche sulle Piazzole (totali, senza settore, con settore)
SELECT 
    COUNT(*) as total_pitches,
    COUNT(*) FILTER (WHERE sector_id IS NULL) as pitches_without_sector,
    COUNT(*) FILTER (WHERE sector_id IS NOT NULL) as pitches_with_sector
FROM pitches;

-- 3. Esempio di 10 piazzole per vedere i dati
SELECT id, number, type, sector_id FROM pitches ORDER BY number LIMIT 10;

-- 4. Verifica bookings recenti
SELECT id, pitch_id, booking_period, status FROM bookings ORDER BY created_at DESC LIMIT 5;
