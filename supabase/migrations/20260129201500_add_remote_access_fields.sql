-- Migration to add remote access fields to equipments table
ALTER TABLE equipments 
ADD COLUMN IF NOT EXISTS remote_access_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS remote_access_password TEXT DEFAULT NULL;

-- Comment on columns for clarity
COMMENT ON COLUMN equipments.serial_number IS 'Serial Number or Service Tag of the equipment';
COMMENT ON COLUMN equipments.remote_access_id IS 'ID for remote access (e.g. AnyDesk, TeamViewer)';
COMMENT ON COLUMN equipments.remote_access_password IS 'Password for remote access (should be treated with care)';
