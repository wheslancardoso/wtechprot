-- Migration: Add Custody Fields to orders table

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS custody_geo_lat FLOAT,
ADD COLUMN IF NOT EXISTS custody_geo_lng FLOAT,
ADD COLUMN IF NOT EXISTS custody_integrity_hash TEXT,
ADD COLUMN IF NOT EXISTS custody_signature_url TEXT,
ADD COLUMN IF NOT EXISTS custody_signed_at TIMESTAMPTZ;

-- Comment on columns for documentation
COMMENT ON COLUMN orders.custody_geo_lat IS 'Latitude captured at the moment of custody signature';
COMMENT ON COLUMN orders.custody_geo_lng IS 'Longitude captured at the moment of custody signature';
COMMENT ON COLUMN orders.custody_integrity_hash IS 'SHA-256 hash of the custody evidence (IP + UA + Geo + Metadata)';
