-- Add stage field to track telemetry at different points in the repair process
ALTER TABLE hardware_telemetry 
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'initial' CHECK (stage IN ('initial', 'post_repair', 'final'));

-- Add comment for documentation
COMMENT ON COLUMN hardware_telemetry.stage IS 'Repair stage: initial (diagnosis), post_repair (after service), final (delivery check)';
