-- =====================================================
-- FIX N-2: add the `personal_id_code` (Codice Fiscale) column
-- =====================================================
-- Date: 2026-06-23
-- Ref:  CODEBASE_ANALYSIS.md § N-2
--
-- PROBLEM:
--   CustomerDialog collects `personal_id_code` (Codice Fiscale) and the TS
--   `Customer` type declares it, but the column does not exist → saving a
--   customer with that field set fails ("Could not find the 'personal_id_code'
--   column"). It matters for questura / schedine alloggiati compliance.
--
-- SAFE: additive only (ADD COLUMN IF NOT EXISTS), no row changes.
-- =====================================================

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS personal_id_code VARCHAR(50);

COMMENT ON COLUMN public.customers.personal_id_code
  IS 'Codice Fiscale / national tax-ID code (collected in CustomerDialog).';

-- =====================================================
-- VERIFICATION (expect one row: personal_id_code | character varying)
-- =====================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'customers'
  AND column_name = 'personal_id_code';
