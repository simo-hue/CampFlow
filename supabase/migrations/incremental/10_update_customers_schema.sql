-- =====================================================
-- CampFlow PMS - Update Customers Schema (Fixed)
-- =====================================================
-- File: 10_update_customers_schema.sql
-- Purpose: Split name, add birth, residence and document details
-- Note: Uses "IF NOT EXISTS" to be safe against partial runs
-- =====================================================

-- 1. Split Name (Drop full_name, add first/last)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name VARCHAR(255) NOT NULL DEFAULT '';

-- Remove default after adding (if you want to force distinct values in future inserts, though API handles it)
ALTER TABLE customers ALTER COLUMN first_name DROP DEFAULT;
ALTER TABLE customers ALTER COLUMN last_name DROP DEFAULT;

-- Drop old column safely
ALTER TABLE customers DROP COLUMN IF EXISTS full_name;

-- 2. Add Birth Details
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_country VARCHAR(100); -- Stato di nascita
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_city VARCHAR(100);    -- Comune di nascita
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_province VARCHAR(50); -- Provincia di nascita
ALTER TABLE customers ADD COLUMN IF NOT EXISTS citizenship VARCHAR(100);   -- Cittadinanza
-- Check constraint handling: easiest way is to add column then add constraint if not exists, 
-- or just add column. Adding check constraint safely is verbose in raw SQL.
-- We'll add the column with check constraint inline (Postgres handles duplicate checks gracefully usually or we skip)
-- Actually "ADD COLUMN IF NOT EXISTS ... CHECK" implies the check is added if column is added. 
-- If column exists but check doesn't, this won't add check. 
-- For simplicity in this fix, we'll assume if column exists, it's fine.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- Safely add constraint if missing (idempotent block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_gender_check') THEN
        ALTER TABLE customers ADD CONSTRAINT customers_gender_check CHECK (gender IN ('M', 'F', 'Other'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


-- 3. Add Residence Details
ALTER TABLE customers ADD COLUMN IF NOT EXISTS residence_country VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS residence_province VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS residence_city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS residence_zip VARCHAR(20);

-- 4. Add Document Details
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_type VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_number VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_issue_country VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_issue_city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_issue_date DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_issuer VARCHAR(100);

COMMENT ON COLUMN customers.first_name IS 'Customer first name';
COMMENT ON COLUMN customers.last_name IS 'Customer last name';
COMMENT ON COLUMN customers.document_type IS 'Type of ID document (carta_identita, passaporto, patente)';
