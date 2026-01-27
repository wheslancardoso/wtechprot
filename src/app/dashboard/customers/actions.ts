'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ==================================================
// Tipos
// ==================================================
export interface CustomerWithStats {
    id: string
    name: string
    document_id: string | null
    phone: string | null
    email: string | null
    address: string | null
    created_at: string
    orders_count: number
    total_ltv: number // Apenas labor_cost (MEI Safe)
    last_order_date: string | null
}

export interface CustomerDetail extends CustomerWithStats {
    orders: Array<{
        id: string
        display_id: number
        status: string
        diagnosis_text: string | null
        labor_cost: number | null
        created_at: string
        finished_at: string | null
        equipment: {
            type: string
            brand: string | null
            model: string | null
            serial_number: string | null
        } | null
    }>
    equipments: Array<{
        id: string
        type: string
        brand: string | null
        model: string | null
        serial_number: string | null
        orders_count: number
    }>
}

// ==================================================
// Listar Clientes com Stats
// ==================================================
export async function getCustomersWithStats(search?: string): Promise<{
    success: boolean
    data?: CustomerWithStats[]
    message?: string
}> {
    try {
        const supabase = await createClient()

        // Buscar clientes
        let query = supabase
            .from('customers')
            .select('*')
            .order('name', { ascending: true })

        // Busca textual
        if (search) {
            const searchClean = search.replace(/\D/g, '')
            if (searchClean.length >= 3) {
                // Busca por CPF
                query = query.ilike('document_id', `%${searchClean}%`)
            } else {
                // Busca por nome
                query = query.ilike('name', `%${search}%`)
            }
        }

        const { data: customers, error } = await query

        if (error) {
            console.error('Erro ao buscar clientes:', error)
            return { success: false, message: error.message }
        }

        // Para cada cliente, buscar stats
        const customersWithStats: CustomerWithStats[] = await Promise.all(
            (customers || []).map(async (customer) => {
                // Contar OS e somar LTV
                const { data: orders } = await supabase
                    .from('orders')
                    .select('labor_cost, created_at, finished_at')
                    .eq('customer_id', customer.id)
                    .eq('status', 'finished')

                const ordersCount = orders?.length || 0
                const totalLtv = orders?.reduce((sum, o) => sum + (o.labor_cost || 0), 0) || 0

                // Última OS
                const { data: lastOrder } = await supabase
                    .from('orders')
                    .select('created_at')
                    .eq('customer_id', customer.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                return {
                    ...customer,
                    orders_count: ordersCount,
                    total_ltv: totalLtv,
                    last_order_date: lastOrder?.created_at || null,
                }
            })
        )

        return { success: true, data: customersWithStats }
    } catch (error) {
        console.error('Erro inesperado:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Buscar Cliente por CPF/Telefone (Autocomplete)
// ==================================================
export async function searchCustomerByIdentifier(identifier: string): Promise<{
    success: boolean
    data?: {
        customer: CustomerWithStats | null
        previousOrders: number
        equipments: string[]
    }
    message?: string
}> {
    try {
        const supabase = await createClient()
        const cleaned = identifier.replace(/\D/g, '')

        if (cleaned.length < 10) {
            return { success: true, data: { customer: null, previousOrders: 0, equipments: [] } }
        }

        // Buscar por CPF ou telefone
        const { data: customer, error } = await supabase
            .from('customers')
            .select('*')
            .or(`document_id.ilike.%${cleaned}%,phone.ilike.%${cleaned}%`)
            .limit(1)
            .single()

        if (error || !customer) {
            return { success: true, data: { customer: null, previousOrders: 0, equipments: [] } }
        }

        // Buscar OS anteriores
        const { data: orders } = await supabase
            .from('orders')
            .select(`
        labor_cost,
        equipment:equipments(type, model)
      `)
            .eq('customer_id', customer.id)

        const previousOrders = orders?.length || 0
        const totalLtv = orders?.reduce((sum, o) => sum + (o.labor_cost || 0), 0) || 0

        // Equipamentos únicos
        const equipmentSet = new Set<string>()
        orders?.forEach((o) => {
            const eq = o.equipment as unknown as { type: string; model: string | null } | null
            if (eq && eq.type) {
                equipmentSet.add(`${eq.type} ${eq.model || ''}`.trim())
            }
        })

        return {
            success: true,
            data: {
                customer: {
                    ...customer,
                    orders_count: previousOrders,
                    total_ltv: totalLtv,
                    last_order_date: null,
                },
                previousOrders,
                equipments: Array.from(equipmentSet),
            }
        }
    } catch (error) {
        console.error('Erro na busca:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Detalhes do Cliente
// ==================================================
export async function getCustomerDetail(customerId: string): Promise<{
    success: boolean
    data?: CustomerDetail
    message?: string
}> {
    try {
        const supabase = await createClient()

        // Buscar cliente
        const { data: customer, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single()

        if (error || !customer) {
            return { success: false, message: 'Cliente não encontrado' }
        }

        // Buscar todas as OS do cliente
        const { data: orders } = await supabase
            .from('orders')
            .select(`
        id,
        display_id,
        status,
        diagnosis_text,
        labor_cost,
        created_at,
        finished_at,
        equipment:equipments(type, brand, model, serial_number)
      `)
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })

        // Agregar equipamentos únicos
        const equipmentMap = new Map<string, {
            id: string
            type: string
            brand: string | null
            model: string | null
            serial_number: string | null
            orders_count: number
        }>()

        orders?.forEach((order) => {
            const eq = order.equipment as unknown as {
                type: string
                brand: string | null
                model: string | null
                serial_number: string | null
            } | null

            if (eq && eq.type) {
                const key = eq.serial_number || `${eq.type}-${eq.brand}-${eq.model}`
                const existing = equipmentMap.get(key)
                if (existing) {
                    existing.orders_count++
                } else {
                    equipmentMap.set(key, {
                        id: key,
                        ...eq,
                        orders_count: 1,
                    })
                }
            }
        })

        // Calcular stats
        const finishedOrders = orders?.filter(o => o.status === 'finished') || []
        const ordersCount = finishedOrders.length
        const totalLtv = finishedOrders.reduce((sum, o) => sum + (o.labor_cost || 0), 0)

        return {
            success: true,
            data: {
                ...customer,
                orders_count: ordersCount,
                total_ltv: totalLtv,
                last_order_date: orders?.[0]?.created_at || null,
                orders: orders || [],
                equipments: Array.from(equipmentMap.values()),
            }
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Atualizar Cliente
// ==================================================
export async function updateCustomer(
    customerId: string,
    data: {
        name?: string
        phone?: string
        email?: string
        address?: string
    }
): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('customers')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('id', customerId)

        if (error) {
            return { success: false, message: error.message }
        }

        revalidatePath(`/dashboard/customers/${customerId}`)
        return { success: true, message: 'Cliente atualizado!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Buscar Histórico do Equipamento
// ==================================================
export async function getEquipmentHistory(serialNumber: string): Promise<{
    success: boolean
    data?: Array<{
        order_id: string
        display_id: number
        diagnosis_text: string | null
        status: string
        created_at: string
        customer_name: string
    }>
    message?: string
}> {
    try {
        if (!serialNumber || serialNumber.length < 5) {
            return { success: true, data: [] }
        }

        const supabase = await createClient()

        const { data: equipments, error } = await supabase
            .from('equipments')
            .select(`
        orders(
          id,
          display_id,
          diagnosis_text,
          status,
          created_at,
          customer:customers(name)
        )
      `)
            .ilike('serial_number', `%${serialNumber}%`)

        if (error) {
            return { success: false, message: error.message }
        }

        // Flatten results
        const history: Array<{
            order_id: string
            display_id: number
            diagnosis_text: string | null
            status: string
            created_at: string
            customer_name: string
        }> = []

        equipments?.forEach((eq) => {
            const ordersArray = eq.orders as unknown as Array<{
                id: string
                display_id: number
                diagnosis_text: string | null
                status: string
                created_at: string
                customer: { name: string } | null
            }>

            if (Array.isArray(ordersArray)) {
                ordersArray.forEach((order) => {
                    history.push({
                        order_id: order.id,
                        display_id: order.display_id,
                        diagnosis_text: order.diagnosis_text,
                        status: order.status,
                        created_at: order.created_at,
                        customer_name: order.customer?.name || 'Desconhecido',
                    })
                })
            }
        })

        return { success: true, data: history }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}
