-- ==================================================
-- MIGRATION: Fix Identity Collision & Receipt Immutability
-- ==================================================

-- 1. Enforce Unique OS Prefix
-- This prevents multiple tenants from having "WT", avoiding ID collisions (e.g. 2026WT-0001).
-- First, we might need to handle duplicates if they exist (Manual cleanup required if so).
-- For now, we assume clean state or user handles errors.
ALTER TABLE tenants 
ADD CONSTRAINT tenants_os_prefix_key UNIQUE (os_prefix);

-- 2. Receipt Immutability (Snapshot)
-- Add a JSONB column to store the store settings AT THE TIME of finishing the order.
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS store_snapshot JSONB;

-- 3. Comment
COMMENT ON COLUMN orders.store_snapshot IS 'Snapshot of tenant settings (name, address, legal) at the time of order completion for immutable receipts.';
