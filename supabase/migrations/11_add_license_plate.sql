-- Add license_plate column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS license_plate VARCHAR(20);

-- Add index for search performance
CREATE INDEX IF NOT EXISTS idx_customers_license_plate ON customers (license_plate);

COMMENT ON COLUMN customers.license_plate IS 'Vehicle license plate number for gate access and identification';
