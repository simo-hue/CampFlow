-- Create Customer Groups table
CREATE TABLE IF NOT EXISTS customer_groups (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT customer_groups_pkey PRIMARY KEY (id),
    CONSTRAINT customer_groups_name_key UNIQUE (name)
);

-- Add group_id to Customers
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'group_id') THEN
        ALTER TABLE customers ADD COLUMN group_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create Group Season Configuration table
CREATE TABLE IF NOT EXISTS group_season_configuration (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES pricing_seasons(id) ON DELETE CASCADE,
    discount_percentage DECIMAL(5,2),
    custom_rates JSONB, -- Stores overrides like { "person": 5, "dog": 0 }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT group_season_configuration_pkey PRIMARY KEY (id),
    CONSTRAINT group_season_config_unique UNIQUE (group_id, season_id)
);

-- Enable RLS (if needed, assuming public/authenticated for now based on other tables)
ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_season_configuration ENABLE ROW LEVEL SECURITY;

-- Policies (Simple permissive for now as per likely dev setup, referencing main schema usually)
-- For now, allowing all authenticated to read/write as this is a PMS internal tool
CREATE POLICY "Enable all for authenticated users on customer_groups" ON customer_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users on group_season_configuration" ON group_season_configuration FOR ALL TO authenticated USING (true) WITH CHECK (true);
