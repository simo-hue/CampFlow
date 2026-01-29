-- Create group_bundles table
CREATE TABLE IF NOT EXISTS group_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
  nights INTEGER NOT NULL CHECK (nights > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  included_services JSONB DEFAULT '["piazzola"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique bundle for specific night count per group
  CONSTRAINT unique_group_bundle_nights UNIQUE (group_id, nights)
);

-- Trigger for updated_at
CREATE TRIGGER update_group_bundles_updated_at
  BEFORE UPDATE ON group_bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE group_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users" ON group_bundles FOR ALL USING (true);
