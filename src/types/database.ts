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

// Interface base para Customer
export interface Customer {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    document?: string | null // CPF/CNPJ
    address?: string | null
    created_at?: string
    updated_at?: string
}

// Interface base para Equipment
export interface Equipment {
    id: string
    type: string | null
    model: string | null
    brand?: string | null
    serial_number?: string | null
    customer_id?: string | null
    created_at?: string
    updated_at?: string
}

// Interface base para Order
export interface Order {
    id: string
    display_id: number
    status: OrderStatus
    customer_id?: string | null
    equipment_id?: string | null
    description?: string | null
    diagnosis?: string | null
    estimated_value?: number | null
    final_value?: number | null
    notes?: string | null
    created_at?: string
    updated_at?: string
    finished_at?: string | null

    // Relacionamentos opcionais (joins)
    customer?: Pick<Customer, 'name'> | null
    equipment?: Pick<Equipment, 'type' | 'model'> | null
}

// Insert types (sem campos auto-gerados)
export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at'> & {
    id?: string
}

export type EquipmentInsert = Omit<Equipment, 'id' | 'created_at' | 'updated_at'> & {
    id?: string
}

export type OrderInsert = Omit<
    Order,
    'id' | 'display_id' | 'created_at' | 'updated_at' | 'customer' | 'equipment'
> & {
    id?: string
}

// Update types (todos os campos opcionais)
export type CustomerUpdate = Partial<CustomerInsert>
export type EquipmentUpdate = Partial<EquipmentInsert>
export type OrderUpdate = Partial<Omit<OrderInsert, 'id'>>

// Database schema para Supabase client
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
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            order_status: OrderStatus
        }
    }
}

// Helper type para extrair Row de uma tabela
export type TableRow<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row']

// Helper type para queries com joins
export type OrderWithRelations = Order & {
    customer: Pick<Customer, 'name'> | null
    equipment: Pick<Equipment, 'type' | 'model'> | null
}
