-- Update source_type check constraint to include 'hwmonitor'
ALTER TABLE hardware_telemetry 
DROP CONSTRAINT IF EXISTS hardware_telemetry_source_type_check;

ALTER TABLE hardware_telemetry 
ADD CONSTRAINT hardware_telemetry_source_type_check 
CHECK (source_type IN ('crystaldisk', 'hwinfo', 'hwmonitor', 'manual'));
