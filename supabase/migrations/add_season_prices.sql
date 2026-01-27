-- Add pricing columns to pricing_seasons table
ALTER TABLE pricing_seasons 
ADD COLUMN IF NOT EXISTS person_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS child_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS dog_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS car_price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Create Default Season if it doesn't exist
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
SELECT 
    'Stagione Base (Default)', 
    '2026-01-01', 
    '2026-12-31', 
    30.00, 
    20.00, 
    10.00, -- Default person price
    5.00,  -- Default child price
    5.00,  -- Default dog price
    5.00,  -- Default car price
    0, 
    '#94a3b8', 
    true
WHERE NOT EXISTS (
    SELECT 1 FROM pricing_seasons WHERE priority = 0
);
