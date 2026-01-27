-- ==================================================
-- MIGRATION: Tenant Settings (Store Info for PDF)
-- ==================================================

-- Add columns to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS trade_name TEXT DEFAULT 'Minha Assistência',
ADD COLUMN IF NOT EXISTS legal_document TEXT, -- CNPJ or CPF
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS warranty_days INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update RLS policies to ensure users can update their own settings
-- (Note: Policies were already created in update_smart_ids.sql, but confirming UPDATE is allowed)

-- Example update for testing (Optional - remove in production or Keep as default)
-- UPDATE tenants SET trade_name = 'Minha Assistência' WHERE trade_name IS NULL;
