-- Add logo_url column to tenants if it doesn't exist
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN tenants.logo_url IS 'URL of the company logo for documents';
