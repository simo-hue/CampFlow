-- =====================================================
-- MIGRATION: Customer Groups & Seasonal Discounts
-- =====================================================

-- 1. Create customer_groups table
CREATE TABLE IF NOT EXISTS customer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3b82f6', -- Default blue
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at in customer_groups
CREATE TRIGGER update_customer_groups_updated_at
  BEFORE UPDATE ON customer_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Add group_id to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_customers_group_id ON customers(group_id);

-- 3. Create group_season_configuration table
-- This table links a specific Group to a specific Season to define custom pricing rules.
CREATE TABLE IF NOT EXISTS group_season_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES pricing_seasons(id) ON DELETE CASCADE,
  
  -- Option A: Percentage Discount (e.g., 10.00 for 10%)
  discount_percentage DECIMAL(5, 2),
  
  -- Option B: Custom Flat Rates (overrides standard season rates if present)
  -- stored as JSON: { "person": 5.00, "dog": 0.00, "car": 2.50 }
  custom_rates JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique configuration per group+season
  CONSTRAINT unique_group_season_config UNIQUE (group_id, season_id)
);

-- Trigger for updated_at in group_season_configuration
CREATE TRIGGER update_group_season_config_updated_at
  BEFORE UPDATE ON group_season_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS (Row Level Security) - permissive for now as per existing pattern or specific rules
ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_season_configuration ENABLE ROW LEVEL SECURITY;

-- Policy for public access (simulated for dev env, adjust for production if needed)
CREATE POLICY "Enable all access for all users" ON customer_groups FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON group_season_configuration FOR ALL USING (true);
