-- Migration: Add missing custody fields to orders table
-- Fixes error: Could not find the 'accessories_received' column

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS accessories_received TEXT[], -- Array of strings for accessories
ADD COLUMN IF NOT EXISTS custody_conditions TEXT; -- Text description of physical conditions

COMMENT ON COLUMN orders.accessories_received IS 'List of accessories collected from the customer';
COMMENT ON COLUMN orders.custody_conditions IS 'Description of physical conditions/damages reported during check-in';
