-- =====================================================
-- CampFlow PMS - Dynamic Seasonal Pricing System
-- =====================================================
-- File: 09_pricing_seasons.sql
-- Purpose: Flexible seasonal pricing with priority-based overlaps
-- Execution Order: 9th
-- =====================================================

-- =====================================================
-- TABLE: pricing_seasons
-- Stores configurable seasonal pricing periods
-- Supports overlapping periods with priority resolution
-- =====================================================
CREATE TABLE IF NOT EXISTS pricing_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Season identification
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Date range (inclusive)
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Prices per pitch type (per day)
    piazzola_price_per_day DECIMAL(10,2) NOT NULL CHECK (piazzola_price_per_day >= 0),
    tenda_price_per_day DECIMAL(10,2) NOT NULL CHECK (tenda_price_per_day >= 0),
    
    -- Priority for overlap resolution (higher number = higher priority)
    -- Example: Regular season = 0, Special events = 10, Holidays = 20
    priority INTEGER NOT NULL DEFAULT 0 CHECK (priority >= 0),
    
    -- Color for UI display (hex code)
    color VARCHAR(7) DEFAULT '#3b82f6',
    
    -- Active flag for soft delete
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Efficient date range queries for price calculation
CREATE INDEX idx_pricing_seasons_dates ON pricing_seasons (start_date, end_date, is_active)
WHERE is_active = true;

-- Query by priority for overlap resolution
CREATE INDEX idx_pricing_seasons_priority ON pricing_seasons (priority DESC)
WHERE is_active = true;

-- Combined index for optimal overlap queries
CREATE INDEX idx_pricing_seasons_date_priority ON pricing_seasons (start_date, end_date, priority DESC, is_active)
WHERE is_active = true;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_pricing_seasons_updated_at
    BEFORE UPDATE ON pricing_seasons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE pricing_seasons IS 'Configurable seasonal pricing periods with priority-based overlap resolution';
COMMENT ON COLUMN pricing_seasons.priority IS 'Priority level: higher number wins in overlap scenarios (0=lowest, 100=highest)';
COMMENT ON COLUMN pricing_seasons.color IS 'Hex color code for UI calendar display';
COMMENT ON COLUMN pricing_seasons.is_active IS 'Soft delete flag - inactive seasons not used in calculations';

-- =====================================================
-- SEED DATA - Default Italian Camping Seasons
-- =====================================================

-- Base seasons (priority 0 - lowest)
INSERT INTO pricing_seasons 
    (name, description, start_date, end_date, piazzola_price_per_day, tenda_price_per_day, priority, color) 
VALUES
    -- Bassa Stagione Inverno
    ('Bassa Stagione', 'Inverno - Gennaio a Aprile', '2026-01-01', '2026-04-30', 20.00, 15.00, 0, '#94a3b8'),
    
    -- Media Stagione Primavera
    ('Media Stagione', 'Primavera - Maggio', '2026-05-01', '2026-05-31', 30.00, 20.00, 5, '#fbbf24'),
    
    -- Alta Stagione Estate
    ('Alta Stagione', 'Estate - Giugno ad Agosto', '2026-06-01', '2026-08-31', 40.00, 25.00, 10, '#ef4444'),
    
    -- Media Stagione Autunno
    ('Media Stagione', 'Autunno - Settembre', '2026-09-01', '2026-09-30', 30.00, 20.00, 5, '#fbbf24'),
    
    -- Bassa Stagione Fine Anno
    ('Bassa Stagione', 'Fine Anno - Ottobre a Dicembre', '2026-10-01', '2026-12-31', 20.00, 15.00, 0, '#94a3b8');

-- Special event examples (priority 20 - high)
-- These can be added by user via UI
INSERT INTO pricing_seasons 
    (name, description, start_date, end_date, piazzola_price_per_day, tenda_price_per_day, priority, color) 
VALUES
    ('Ferragosto', 'Picco stagionale estivo', '2026-08-10', '2026-08-20', 50.00, 30.00, 20, '#dc2626'),
    ('Natale', 'Festività natalizie', '2026-12-20', '2027-01-06', 35.00, 25.00, 15, '#10b981')
ON CONFLICT DO NOTHING;

-- =====================================================
-- HELPER FUNCTION: Get price for specific date and pitch type
-- =====================================================

CREATE OR REPLACE FUNCTION get_price_for_date(
    p_date DATE,
    p_pitch_type VARCHAR(50)
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_price DECIMAL(10,2);
BEGIN
    -- Find the highest priority active season that contains this date
    SELECT 
        CASE 
            WHEN p_pitch_type = 'piazzola' THEN piazzola_price_per_day
            WHEN p_pitch_type = 'tenda' THEN tenda_price_per_day
            ELSE 0
        END INTO v_price
    FROM pricing_seasons
    WHERE is_active = true
      AND p_date BETWEEN start_date AND end_date
    ORDER BY priority DESC, created_at DESC
    LIMIT 1;
    
    -- Return price or default if no season found
    RETURN COALESCE(v_price, 25.00);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_price_for_date IS 'Returns the price for a specific date based on highest priority active season';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check table structure
-- \d pricing_seasons

-- View all active seasons
-- SELECT * FROM pricing_seasons WHERE is_active = true ORDER BY start_date, priority DESC;

-- Test overlap resolution for a specific date
-- SELECT name, priority, 
--        CASE WHEN '2026-08-15' BETWEEN start_date AND end_date THEN 'MATCH' ELSE 'no' END as matches,
--        piazzola_price_per_day
-- FROM pricing_seasons 
-- WHERE is_active = true 
-- ORDER BY priority DESC;

-- Test helper function
-- SELECT get_price_for_date('2026-08-15', 'piazzola'); -- Should return 50.00 (Ferragosto, highest priority)
-- SELECT get_price_for_date('2026-07-15', 'piazzola'); -- Should return 40.00 (Alta Stagione)
