-- Consolidated Fix: Add ALL Custody Columns + Reload Schema Cache
-- Run this entire script in Supabase SQL Editor

-- 1. Add all potential missing columns (safe to run multiple times)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS accessories_received TEXT[],
ADD COLUMN IF NOT EXISTS custody_conditions TEXT,
ADD COLUMN IF NOT EXISTS custody_geo_lat FLOAT,
ADD COLUMN IF NOT EXISTS custody_geo_lng FLOAT,
ADD COLUMN IF NOT EXISTS custody_integrity_hash TEXT,
ADD COLUMN IF NOT EXISTS custody_signature_url TEXT,
ADD COLUMN IF NOT EXISTS custody_signed_at TIMESTAMPTZ;

-- 2. Force PostgREST to refresh its schema cache
-- This fixes the error: "Could not find the ... column ... in the schema cache"
NOTIFY pgrst, 'reload schema';
