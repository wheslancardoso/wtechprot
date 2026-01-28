-- ==================================================
-- MIGRATION: Signature Evidence (Click-Agreement)
-- ==================================================

-- Add signature_evidence column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS signature_evidence JSONB;

-- Comment: Stores metadata like IP, UserAgent, Timestamp, Geolocation
-- Example:
-- {
--   "ip": "200.1.2.3",
--   "userAgent": "Mozilla/5.0...",
--   "timestamp": "2026-01-28T10:00:00Z",
--   "method": "CLICK_WRAP_V1"
-- }
