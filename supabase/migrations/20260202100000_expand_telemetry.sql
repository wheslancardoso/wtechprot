-- Add new columns for enhanced hardware details
alter table hardware_telemetry
add column if not exists cpu_model text,
add column if not exists motherboard_model text,
add column if not exists ram_total_gb integer,
add column if not exists gpu_model text;
