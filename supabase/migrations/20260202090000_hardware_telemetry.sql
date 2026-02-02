-- Create hardware_telemetry table
create table if not exists hardware_telemetry (
    id uuid default gen_random_uuid() primary key,
    order_id uuid not null references orders(id) on delete cascade,
    equipment_id uuid not null references equipments(id) on delete cascade,
    tenant_id uuid not null references tenants(id) on delete cascade,
    
    source_type text not null check (source_type in ('crystaldisk', 'hwinfo', 'manual')),
    
    -- Telemetry Data
    ssd_health_percent integer check (ssd_health_percent between 0 and 100),
    ssd_tbw decimal(10, 2), -- Total Bytes Written in TB
    cpu_temp_max decimal(5, 1),
    battery_cycles integer,
    battery_wear_level integer check (battery_wear_level between 0 and 100),
    
    -- Parsing & Audit
    raw_content text, -- Content of the uploaded file for audit
    health_score integer check (health_score between 0 and 100),
    
    created_at timestamptz default now() not null
);

-- Indexes for performance
create index if not exists idx_telemetry_order on hardware_telemetry(order_id);
create index if not exists idx_telemetry_equipment on hardware_telemetry(equipment_id);
create index if not exists idx_telemetry_tenant on hardware_telemetry(tenant_id);

-- Enable RLS
alter table hardware_telemetry enable row level security;

-- Policies
create policy "Users can view telemetry from their tenant"
    on hardware_telemetry for select
    using (tenant_id = (select auth.jwt() ->> 'tenant_id')::uuid);

create policy "Users can insert telemetry for their tenant"
    on hardware_telemetry for insert
    with check (tenant_id = (select auth.jwt() ->> 'tenant_id')::uuid);

-- Grant permissions
grant all on hardware_telemetry to authenticated;
grant all on hardware_telemetry to service_role;
