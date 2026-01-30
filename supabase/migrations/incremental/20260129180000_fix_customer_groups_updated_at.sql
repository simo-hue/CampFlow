-- Add updated_at column to customer_groups which was missing
ALTER TABLE customer_groups 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Trigger for updated_at is likely already there but failed, or maybe not. 
-- Just in case, ensure trigger exists (re-creation is safe with OR REPLACE)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_customer_groups_updated_at ON customer_groups;

CREATE TRIGGER update_customer_groups_updated_at
  BEFORE UPDATE ON customer_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
