export type TelemetrySource = 'crystaldisk' | 'hwinfo' | 'manual'

export interface HardwareTelemetry {
    id: string
    order_id: string
    equipment_id: string
    tenant_id: string

    source_type: TelemetrySource

    // Core Health Data
    ssd_health_percent?: number
    ssd_tbw?: number
    cpu_temp_max?: number
    battery_cycles?: number
    battery_wear_level?: number

    // Enhanced Fields (Detailed Info)
    cpu_model?: string
    motherboard_model?: string
    ram_total_gb?: number
    gpu_model?: string

    // Parsing Audit
    health_score?: number
    raw_content?: string

    created_at: string
}

export interface TelemetryInsert {
    order_id: string
    equipment_id: string
    tenant_id?: string // Optional on insert (handled by RLS/Backend)

    source_type: TelemetrySource

    ssd_health_percent?: number
    ssd_tbw?: number
    cpu_temp_max?: number
    battery_cycles?: number
    battery_wear_level?: number

    // Enhanced Fields
    cpu_model?: string
    motherboard_model?: string
    ram_total_gb?: number
    gpu_model?: string

    health_score?: number
    raw_content?: string
}
