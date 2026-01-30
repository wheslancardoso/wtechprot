// ==================================================
// Database Types - Schema V2.0 (Compra Assistida)
// ==================================================

// Enum de status de ordem de serviço
export type OrderStatus =
    | 'open'
    | 'analyzing'
    | 'waiting_approval'
    | 'waiting_parts'
    | 'in_progress'
    | 'ready'
    | 'finished'
    | 'canceled'

// Enum de tipo de item da ordem
export type OrderItemType = 'service' | 'part_external'

// ==================================================
// Row Types (dados vindos do banco)
// ==================================================

export interface Customer {
    id: string
    user_id: string
    name: string
    phone: string | null
    document_id: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface Equipment {
    id: string
    customer_id: string
    type: string | null
    brand: string | null
    model: string | null
    serial_number: string | null
    remote_access_id: string | null
    remote_access_password: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface Order {
    id: string
    display_id: number
    user_id: string
    customer_id: string | null
    equipment_id: string | null
    status: OrderStatus
    labor_cost: number
    parts_cost_external: number
    diagnosis_text: string | null
    solution_text: string | null
    created_at: string
    updated_at: string
    finished_at: string | null
    // Home Care / Custody fields
    accessories_received: string[] | null // JSONB array of strings
    custody_conditions: string | null
    custody_signed_at: string | null
    custody_signature_url: string | null
    custody_ip: string | null
    custody_geo_lat: number | null
    custody_geo_lng: number | null
    custody_integrity_hash: string | null
    custody_photos: { label: string; url: string }[] | null // New field
    collected_by: string | null // UUID of the technician
    // Relacionamentos opcionais (joins)
    customer?: Pick<Customer, 'name'> | null
    equipment?: Pick<Equipment, 'type' | 'model' | 'serial_number'> | null
}

export interface OrderItem {
    id: string
    order_id: string
    title: string
    type: OrderItemType
    price: number
    external_url: string | null
    notes: string | null
    created_at: string
}

// ==================================================
// Insert Types (para criar registros)
// ==================================================

export interface CustomerInsert {
    id?: string
    user_id: string
    name: string
    phone?: string | null
    document_id?: string | null
    notes?: string | null
}

export interface EquipmentInsert {
    id?: string
    customer_id: string
    type?: string | null
    brand?: string | null
    model?: string | null
    serial_number?: string | null
    remote_access_id?: string | null
    remote_access_password?: string | null
    notes?: string | null
}

export interface OrderInsert {
    id?: string
    user_id: string
    customer_id?: string | null
    equipment_id?: string | null
    status?: OrderStatus
    labor_cost?: number
    parts_cost_external?: number
    diagnosis_text?: string | null
    solution_text?: string | null
    // Home Care / Custody fields
    accessories_received?: string[] | null
    custody_conditions?: string | null
    custody_signed_at?: string | null
    custody_signature_url?: string | null
    custody_geo_lat?: number | null
    custody_geo_lng?: number | null
    custody_integrity_hash?: string | null
    collected_by?: string | null
}

export interface OrderItemInsert {
    id?: string
    order_id: string
    title: string
    type?: OrderItemType
    price?: number
    external_url?: string | null
    notes?: string | null
}

// ==================================================
// Update Types (para atualizar registros)
// ==================================================

export type CustomerUpdate = Partial<Omit<CustomerInsert, 'user_id'>>
export type EquipmentUpdate = Partial<Omit<EquipmentInsert, 'customer_id'>>
export type OrderUpdate = Partial<Omit<OrderInsert, 'user_id'>>
export type OrderItemUpdate = Partial<Omit<OrderItemInsert, 'order_id'>>

// ==================================================
// Database Schema (para tipagem do Supabase Client)
// ==================================================

export interface Database {
    public: {
        Tables: {
            customers: {
                Row: Customer
                Insert: CustomerInsert
                Update: CustomerUpdate
            }
            equipments: {
                Row: Equipment
                Insert: EquipmentInsert
                Update: EquipmentUpdate
            }
            orders: {
                Row: Order
                Insert: OrderInsert
                Update: OrderUpdate
            }
            order_items: {
                Row: OrderItem
                Insert: OrderItemInsert
                Update: OrderItemUpdate
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            order_status: OrderStatus
            order_item_type: OrderItemType
        }
    }
}

// ==================================================
// Helper Types
// ==================================================

export type TableRow<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row']

export type OrderWithRelations = Order & {
    customer: Pick<Customer, 'name'> | null
    equipment: Pick<Equipment, 'type' | 'model' | 'serial_number'> | null
}
