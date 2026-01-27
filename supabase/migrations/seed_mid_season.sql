-- Insert Mid Season (June 12 - July 23)
-- Prices:
-- Adult: 9
-- Child: 5
-- Pitch (Piazzola): 10  (Increased from default 9)
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
    'Media Stagione',
    '2025-06-12', 
    '2025-07-23',
    10.00,  -- Piazzola (Default 9)
    10.00,  -- Tenda (Assumed equal to Piazzola as per pattern)
    9.00,   -- Adulto
    5.00,   -- Bambino
    3.00,   -- Cane
    5.00,   -- Auto
    10,     -- Priority 10 (Overrides Default which is 0)
    '#3b82f6', -- Blue color
    true
);

-- Note: This creates the season for 2025. You might want to duplicate this for future years if needed.
