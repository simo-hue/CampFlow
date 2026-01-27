-- =====================================================
-- CampFlow PMS - Seed Data
-- =====================================================
-- File: 06_seed_data.sql
-- Purpose: Initial data for development and testing
-- Execution Order: 6th (after functions)
-- =====================================================

-- =====================================================
-- SAMPLE PITCHES
-- =====================================================
-- Insert sample pitches for testing (15 pitches total)
-- In production, you'll need to generate all 300 pitches

INSERT INTO pitches (number, suffix, type, attributes) VALUES
  -- Piazzole standard (001-005)
  ('001', '', 'piazzola', '{"shade": true, "electricity": true, "water": true}'),
  ('002', '', 'piazzola', '{"shade": false, "electricity": true, "water": true}'),
  ('003', '', 'piazzola', '{"shade": true, "electricity": true, "water": true, "sewer": true}'),
  ('004', '', 'piazzola', '{"shade": true, "electricity": true, "water": false}'),
  ('005', '', 'piazzola', '{"shade": false, "electricity": true, "water": true}'),
  
  -- Tende (101-105)
  ('101', '', 'tenda', '{"shade": true, "electricity": false}'),
  ('102', '', 'tenda', '{"shade": false, "electricity": false}'),
  ('103', '', 'tenda', '{"shade": true, "electricity": true}'),
  ('104', '', 'tenda', '{"shade": true, "electricity": false}'),
  ('105', '', 'tenda', '{"shade": false, "electricity": true}'),
  
  -- Altre Piazzole (201-205)
  ('201', '', 'piazzola', '{"shade": true, "electricity": true, "water": true, "size_sqm": 80}'),
  ('202', '', 'piazzola', '{"shade": true, "electricity": true, "water": true, "size_sqm": 100}'),
  ('203', '', 'piazzola', '{"shade": false, "electricity": true, "water": true, "size_sqm": 90}'),
  ('204', '', 'piazzola', '{"shade": true, "electricity": true, "water": true, "sewer": true, "size_sqm": 120}'),
  ('205', '', 'piazzola', '{"shade": true, "electricity": true, "water": true, "size_sqm": 85}')
ON CONFLICT (number, suffix) DO NOTHING;

-- =====================================================
-- PRODUCTION SETUP NOTE
-- =====================================================
-- For production deployment with 300 pitches, use a script like this:
--
-- DO $$
-- DECLARE
--   i INTEGER;
-- BEGIN
--   -- Piazzole 1-100
--   FOR i IN 1..100 LOOP
--     INSERT INTO pitches (number, suffix, type, attributes)
--     VALUES (LPAD(i::TEXT, 3, '0'), '', 'piazzola', '{}')
--     ON CONFLICT (number, suffix) DO NOTHING;
--   END LOOP;
--   
--   -- Tende 101-200
--   FOR i IN 101..200 LOOP
--     INSERT INTO pitches (number, suffix, type, attributes)
--     VALUES (LPAD(i::TEXT, 3, '0'), '', 'tenda', '{}')
--     ON CONFLICT (number, suffix) DO NOTHING;
--   END LOOP;
--   
--   -- Altre Piazzole 201-300
--   FOR i IN 201..300 LOOP
--     INSERT INTO pitches (number, suffix, type, attributes)
--     VALUES (LPAD(i::TEXT, 3, '0'), '', 'piazzola', '{}')
--     ON CONFLICT (number, suffix) DO NOTHING;
--   END LOOP;
-- END $$;

-- =====================================================
-- SAMPLE CUSTOMER (Optional - for testing only)
-- =====================================================
-- Uncomment to create a test customer:
--
-- INSERT INTO customers (full_name, email, phone, address, notes) VALUES
--   ('Mario Rossi', 'mario.rossi@example.com', '+39 333 1234567', 'Via Roma 1, Milano', 'Cliente abituale')
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify seed data:
-- SELECT COUNT(*) FROM pitches; -- Should return 15 (or 300 in production)
-- SELECT type, COUNT(*) FROM pitches GROUP BY type;
-- SELECT * FROM pitches ORDER BY number, suffix LIMIT 10;
