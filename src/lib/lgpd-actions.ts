'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createHash } from 'crypto'

// ==================================================
// Anonimizar Cliente (LGPD - Direito ao Esquecimento)
// ==================================================
export async function anonymizeCustomer(
    customerId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        // 1. Verificar se cliente existe
        const { data: customer, error: fetchError } = await supabase
            .from('customers')
            .select('id, name')
            .eq('id', customerId)
            .single()

        if (fetchError || !customer) {
            return { success: false, message: 'Cliente não encontrado' }
        }

        // 2. Verificar se tem OS abertas ou em andamento
        const { data: openOrders, error: ordersError } = await supabase
            .from('orders')
            .select('id, status')
            .eq('customer_id', customerId)
            .in('status', ['open', 'analyzing', 'waiting_approval', 'waiting_parts', 'in_progress', 'ready'])

        if (ordersError) {
            return { success: false, message: ordersError.message }
        }

        if (openOrders && openOrders.length > 0) {
            return {
                success: false,
                message: `Não é possível anonimizar: cliente possui ${openOrders.length} OS em aberto. Finalize ou cancele as OS primeiro.`,
            }
        }

        // 3. Gerar dados anonimizados
        const anonymousId = customerId.substring(0, 8).toUpperCase()
        const hashEmail = createHash('md5').update(customerId + 'email').digest('hex').substring(0, 12)
        const hashPhone = createHash('md5').update(customerId + 'phone').digest('hex').substring(0, 12)
        const hashDoc = createHash('md5').update(customerId + 'doc').digest('hex').substring(0, 12)

        // 4. Atualizar dados do cliente (anonimização irreversível)
        const { error: updateError } = await supabase
            .from('customers')
            .update({
                name: `Cliente Anonimizado [${anonymousId}]`,
                email: `anonimizado_${hashEmail}@lgpd.local`,
                phone: `ANON_${hashPhone}`,
                document_id: `ANON_${hashDoc}`,
                address: null,
                notes: 'Dados anonimizados conforme solicitação LGPD',
                updated_at: new Date().toISOString(),
            })
            .eq('id', customerId)

        if (updateError) {
            return { success: false, message: updateError.message }
        }

        // 5. Registrar log de anonimização
        // (Opcional: criar tabela lgpd_logs se necessário)

        revalidatePath('/dashboard/customers')
        revalidatePath(`/dashboard/customers/${customerId}`)

        return {
            success: true,
            message: 'Dados pessoais anonimizados com sucesso. As OS e valores foram mantidos para fins fiscais.',
        }
    } catch (error) {
        console.error('Erro na anonimização:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

// ==================================================
// Verificar Elegibilidade para Anonimização
// ==================================================
export async function checkAnonymizationEligibility(
    customerId: string
): Promise<{ eligible: boolean; reason?: string; openOrdersCount?: number }> {
    try {
        const supabase = await createClient()

        // Verificar OS abertas
        const { data: openOrders, error } = await supabase
            .from('orders')
            .select('id')
            .eq('customer_id', customerId)
            .in('status', ['open', 'analyzing', 'waiting_approval', 'waiting_parts', 'in_progress', 'ready'])

        if (error) {
            return { eligible: false, reason: error.message }
        }

        if (openOrders && openOrders.length > 0) {
            return {
                eligible: false,
                reason: 'Cliente possui OS em aberto',
                openOrdersCount: openOrders.length,
            }
        }

        return { eligible: true }
    } catch {
        return { eligible: false, reason: 'Erro ao verificar elegibilidade' }
    }
}

// ==================================================
// Exportar Dados do Cliente (LGPD - Direito de Acesso)
// ==================================================
export async function exportCustomerData(
    customerId: string
): Promise<{ success: boolean; data?: object; message?: string }> {
    try {
        const supabase = await createClient()

        // Buscar todos os dados do cliente
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single()

        if (customerError || !customer) {
            return { success: false, message: 'Cliente não encontrado' }
        }

        // Buscar OS do cliente
        const { data: orders } = await supabase
            .from('orders')
            .select(`
        id,
        display_id,
        status,
        diagnosis_text,
        labor_cost,
        parts_cost_external,
        created_at,
        finished_at,
        equipment:equipments(type, brand, model)
      `)
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })

        // Montar relatório LGPD
        const lgpdReport = {
            _lgpd_info: {
                exportDate: new Date().toISOString(),
                purpose: 'Exportação de dados conforme Art. 18 da LGPD',
                dataController: 'Configurado em tenant_settings',
            },
            personalData: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                document_id: customer.document_id,
                address: customer.address,
                createdAt: customer.created_at,
            },
            serviceHistory: orders?.map((o) => ({
                orderNumber: o.display_id,
                status: o.status,
                diagnosis: o.diagnosis_text,
                laborCost: o.labor_cost,
                externalPartsCost: o.parts_cost_external,
                createdAt: o.created_at,
                finishedAt: o.finished_at,
                equipment: o.equipment,
            })),
        }

        return { success: true, data: lgpdReport }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}
