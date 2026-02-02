-- Add detailed hardware info fields
ALTER TABLE hardware_telemetry 
ADD COLUMN IF NOT EXISTS ssd_total_gb INTEGER,
ADD COLUMN IF NOT EXISTS ram_speed INTEGER,
ADD COLUMN IF NOT EXISTS ram_slots INTEGER;

-- Update commentary
COMMENT ON COLUMN hardware_telemetry.ssd_total_gb IS 'Total SSD capacity in GB';
COMMENT ON COLUMN hardware_telemetry.ram_speed IS 'RAM Frequency in MHz';
COMMENT ON COLUMN hardware_telemetry.ram_slots IS 'Number of occupied RAM slots';
