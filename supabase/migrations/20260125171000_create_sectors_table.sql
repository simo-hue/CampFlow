-- Create sectors table
CREATE TABLE sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Separate trigger creation to handle potential existence
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sectors_updated_at') THEN
        CREATE TRIGGER update_sectors_updated_at
        BEFORE UPDATE ON sectors
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Seed initial data
INSERT INTO sectors (name) VALUES
    ('Settore 1'),
    ('Settore 2'),
    ('Settore 3'),
    ('Settore 4');
