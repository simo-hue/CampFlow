-- =====================================================
-- Migration: Add Manual Pricing Support
-- =====================================================
-- 1. Add force_manual_price to customer_groups (default false)
ALTER TABLE customer_groups 
ADD COLUMN IF NOT EXISTS force_manual_price BOOLEAN NOT NULL DEFAULT false;

-- 2. Add is_manual_price to bookings (default false)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS is_manual_price BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN customer_groups.force_manual_price IS 'If true, bookings for this group require manual price entry';
COMMENT ON COLUMN bookings.is_manual_price IS 'If true, total_price is manually entered rather than calculated';
