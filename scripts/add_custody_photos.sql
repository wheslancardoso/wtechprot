-- Add custody_photos column to orders if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS custody_photos JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN orders.custody_photos IS 'List of photos taken during check-in (url, label)';
