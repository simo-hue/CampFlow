-- Insert High Season (July 24 - August 30)
-- Prices (Requested Identical to Mid Season):
-- Adult: 9
-- Child: 5
-- Pitch (Piazzola): 10
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
    'Alta Stagione',
    '2025-07-24', 
    '2025-08-30',
    10.00,  -- Piazzola
    10.00,  -- Tenda
    9.00,   -- Adulto
    5.00,   -- Bambino
    3.00,   -- Cane
    5.00,   -- Auto
    20,     -- Priority 20 (Higher than Mid Season)
    '#f97316', -- Orange color
    true
);
