-- Insert Default Season (Low Season) with User Defined Prices
-- Prices:
-- Adult: 9
-- Child: 5
-- Pitch (Piazzola): 9
-- Car: 5
-- Dog: 3

INSERT INTO pricing_seasons (
    name,
    start_date,
    end_date,
    piazzola_price_per_day,
    tenda_price_per_day,
    person_price_per_day,
    child_price_per_day,
    dog_price_per_day,
    car_price_per_day,
    priority,
    color,
    is_active
)
VALUES (
    'Bassa Stagione (Default)',
    '2025-01-01', -- Start from 2025 to cover current dates and future
    '2026-12-31',
    9.00,  -- Piazzola
    9.00,  -- Tenda (assumed same as Piazzola)
    9.00,  -- Adulto
    5.00,  -- Bambino
    3.00,  -- Cane
    5.00,  -- Auto
    0,     -- Priority 0 (Lowest/Default)
    '#94a3b8', -- Gray color
    true
)
ON CONFLICT (id) DO NOTHING; -- Assuming ID might be auto-generated, but usually we don't conflict on ID for new inserts. 
-- Better to check existence if we want to be idempotent, but for "empty db" insert is fine.
