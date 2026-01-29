'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ==================================================
// Zod Schema para validação
// ==================================================
const createOrderSchema = z.object({
    // Cliente
    customerCpf: z.string().min(11, 'CPF inválido'),
    customerName: z.string().min(2, 'Nome obrigatório'),
    customerPhone: z.string().min(10, 'WhatsApp inválido'),

    // Equipamento
    equipmentType: z.string().min(1, 'Tipo obrigatório'),
    equipmentBrand: z.string().optional(),
    equipmentModel: z.string().optional(),
    equipmentPassword: z.string().optional(),

    // Detalhes
    defectReport: z.string().min(10, 'Descreva o problema'),
    hasAccessories: z.string().optional(), // FormData envia como string
    accessoriesDescription: z.string().optional(),
})

// ==================================================
// Tipo de retorno padrão
// ==================================================
type ActionResult = {
    success: boolean
    message: string
    orderId?: string
}

// ==================================================
// Server Action: Criar Ordem de Serviço
// ==================================================
export async function createOrder(formData: FormData): Promise<ActionResult> {
    try {
        // 1. Extrair e validar dados do FormData
        const rawData = {
            customerCpf: formData.get('customerCpf') as string,
            customerName: formData.get('customerName') as string,
            customerPhone: formData.get('customerPhone') as string,
            equipmentType: formData.get('equipmentType') as string,
            equipmentBrand: formData.get('equipmentBrand') as string,
            equipmentModel: formData.get('equipmentModel') as string,
            equipmentPassword: formData.get('equipmentPassword') as string,
            defectReport: formData.get('defectReport') as string,
            hasAccessories: formData.get('hasAccessories') as string,
            accessoriesDescription: formData.get('accessoriesDescription') as string,
        }

        const validatedData = createOrderSchema.parse(rawData)

        // 2. Criar cliente Supabase
        const supabase = await createClient()

        // 3. Verificar usuário autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        // 4. Limpar CPF (remover máscara)
        const cpfClean = validatedData.customerCpf.replace(/\D/g, '')

        // 5. Verificar se cliente já existe pelo CPF
        let customerId: string

        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('document_id', cpfClean)
            .eq('user_id', user.id)
            .single()

        if (existingCustomer) {
            // Cliente já existe, usar ID existente
            customerId = existingCustomer.id
        } else {
            // Criar novo cliente
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert({
                    user_id: user.id,
                    name: validatedData.customerName,
                    phone: validatedData.customerPhone,
                    document_id: cpfClean,
                })
                .select('id')
                .single()

            if (customerError || !newCustomer) {
                console.error('Erro ao criar cliente:', customerError)
                return { success: false, message: `Erro ao criar cliente: ${customerError?.message}` }
            }

            customerId = newCustomer.id
        }

        // 6. Criar equipamento
        const { data: equipment, error: equipmentError } = await supabase
            .from('equipments')
            .insert({
                customer_id: customerId,
                type: validatedData.equipmentType,
                brand: validatedData.equipmentBrand || null,
                model: validatedData.equipmentModel || null,
                notes: validatedData.equipmentPassword
                    ? `Senha: ${validatedData.equipmentPassword}`
                    : null,
            })
            .select('id')
            .single()

        if (equipmentError || !equipment) {
            console.error('Erro ao criar equipamento:', equipmentError)
            return { success: false, message: `Erro ao criar equipamento: ${equipmentError?.message}` }
        }

        // 7. Montar texto de diagnóstico inicial
        const hasAccessories = validatedData.hasAccessories === 'on' || validatedData.hasAccessories === 'true'
        const accessoriesText = hasAccessories
            ? `Acessórios: ${validatedData.accessoriesDescription || 'Sim (não especificados)'}`
            : 'Sem acessórios'

        const diagnosisText = `Relato do cliente:\n${validatedData.defectReport}\n\n${accessoriesText}`

        // 8. Criar ordem de serviço
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                customer_id: customerId,
                equipment_id: equipment.id,
                status: 'open',
                labor_cost: 0,
                parts_cost_external: 0,
                diagnosis_text: diagnosisText,
            })
            .select('id, display_id')
            .single()

        if (orderError || !order) {
            console.error('Erro ao criar OS:', orderError)
            return { success: false, message: `Erro ao criar OS: ${orderError?.message}` }
        }

        // 9. Revalidar cache da listagem
        revalidatePath('/dashboard/orders')

        // 10. Retornar sucesso
        return {
            success: true,
            message: `OS #${order.display_id} criada com sucesso!`,
            orderId: order.id,
        }

    } catch (error) {
        // Erro de validação Zod
        if (error instanceof z.ZodError) {
            const firstIssue = error.issues[0]
            return {
                success: false,
                message: `Validação falhou: ${firstIssue.path.join('.')} - ${firstIssue.message}`
            }
        }

        // Outros erros
        console.error('Erro inesperado ao criar OS:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Status válidos do sistema
// ==================================================
const validStatuses = [
    'open',
    'analyzing',
    'waiting_approval',
    'waiting_parts',
    'in_progress',
    'ready',
    'finished',
    'canceled',
] as const

type OrderStatus = typeof validStatuses[number]

// ==================================================
// Server Action: Atualizar Status da OS
// ==================================================
export async function updateOrderStatus(
    orderId: string,
    newStatus: string
): Promise<ActionResult> {
    try {
        // 1. Validar se o status é válido
        if (!validStatuses.includes(newStatus as OrderStatus)) {
            return {
                success: false,
                message: `Status inválido: "${newStatus}". Status válidos: ${validStatuses.join(', ')}`
            }
        }

        // 2. Validar orderId
        if (!orderId || orderId.length < 10) {
            return { success: false, message: 'ID da OS inválido' }
        }

        // 3. Criar cliente Supabase
        const supabase = await createClient()

        // 4. Verificar usuário autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        // 5. Preparar dados de atualização
        const updateData: { status: string; finished_at?: string } = {
            status: newStatus
        }

        // Se finalizando, adicionar data de finalização
        if (newStatus === 'finished') {
            updateData.finished_at = new Date().toISOString()
        }

        // 6. Atualizar status no banco
        const { error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .eq('user_id', user.id) // Garantir que só atualiza OS do próprio usuário

        if (updateError) {
            console.error('Erro ao atualizar status:', updateError)
            return { success: false, message: `Erro ao atualizar: ${updateError.message}` }
        }

        // 7. Revalidar caches
        revalidatePath('/dashboard/orders')
        revalidatePath(`/dashboard/orders/${orderId}`)

        // 8. Retornar sucesso
        return {
            success: true,
            message: `Status atualizado para "${newStatus}" com sucesso!`
        }

    } catch (error) {
        console.error('Erro inesperado ao atualizar status:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Tipo para peças externas
// ==================================================
interface ExternalPart {
    name: string
    purchaseUrl: string
}

// ==================================================
// Server Action: Salvar Orçamento Técnico
// ==================================================
export async function saveBudget(
    orderId: string,
    diagnosisText: string,
    laborCost: number,
    parts: ExternalPart[]
): Promise<ActionResult> {
    console.log("🔧 Iniciando saveBudget", {
        orderId,
        diagnosisText: diagnosisText.substring(0, 50) + '...',
        laborCost,
        partsCount: parts.length,
        targetStatus: 'waiting_approval'
    })

    try {
        // 1. Validações básicas
        if (!orderId || orderId.length < 10) {
            console.log("❌ saveBudget: ID da OS inválido")
            return { success: false, message: 'ID da OS inválido' }
        }

        if (!diagnosisText || diagnosisText.length < 20) {
            console.log("❌ saveBudget: Laudo muito curto")
            return { success: false, message: 'Laudo técnico deve ter pelo menos 20 caracteres' }
        }

        if (laborCost < 0) {
            console.log("❌ saveBudget: Valor negativo")
            return { success: false, message: 'Valor da mão de obra inválido' }
        }

        // 2. Criar cliente Supabase
        const supabase = await createClient()
        console.log("✅ saveBudget: Cliente Supabase criado")

        // 3. Verificar usuário autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.log("❌ saveBudget: Usuário não autenticado", authError)
            return { success: false, message: 'Usuário não autenticado' }
        }
        console.log("✅ saveBudget: Usuário autenticado:", user.id)

        // 4. Atualizar ordem com novo laudo, valor e status
        // IMPORTANTE: Removido filtro user_id para garantir que o update funcione
        const updatePayload = {
            diagnosis_text: diagnosisText,
            labor_cost: laborCost,
            parts_cost_external: 0,
            status: 'waiting_approval' as const, // CRÍTICO: Forçar mudança de status
        }
        console.log("📝 saveBudget: Payload de update:", updatePayload)

        const { data: updateData, error: orderError } = await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', orderId)
            .select()

        if (orderError) {
            console.error('❌ saveBudget: Erro ao atualizar OS:', orderError)
            return { success: false, message: `Erro ao atualizar OS: ${orderError.message}` }
        }
        console.log("✅ saveBudget: OS atualizada com sucesso:", updateData)

        // 5. Primeiro: Delete os itens antigos (type = 'part_external') dessa OS
        const { error: deleteError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', orderId)
            .eq('type', 'part_external')

        if (deleteError) {
            console.log("⚠️ saveBudget: Erro ao deletar itens antigos (pode não existir):", deleteError.message)
            // Continua mesmo com erro - pode não existir itens
        } else {
            console.log("✅ saveBudget: Itens antigos deletados")
        }

        // 6. Segundo: Insira as novas peças se houver
        if (parts.length > 0) {
            const orderItems = parts.map((part) => ({
                order_id: orderId,
                title: part.name,
                type: 'part_external',
                price: 0,
                external_url: part.purchaseUrl || null,
            }))
            console.log("📦 saveBudget: Inserindo peças:", orderItems)

            const { error: insertError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (insertError) {
                console.error('❌ saveBudget: Erro ao inserir peças:', insertError)
                return { success: false, message: `Erro ao salvar peças: ${insertError.message}` }
            }
            console.log("✅ saveBudget: Peças inseridas com sucesso")
        }

        // 7. Revalidar caches
        revalidatePath('/dashboard/orders')
        revalidatePath(`/dashboard/orders/${orderId}`)
        console.log("✅ saveBudget: Cache revalidado")

        // 8. Retornar sucesso
        const partsText = parts.length > 0 ? ` com ${parts.length} peça(s)` : ''
        console.log("🎉 saveBudget: SUCESSO!")
        return {
            success: true,
            message: `Orçamento salvo${partsText}! Aguardando aprovação do cliente.`
        }

    } catch (error) {
        console.error('❌ saveBudget: Erro inesperado:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Server Action: Confirmar Chegada da Peça
// ==================================================
export async function confirmPartArrival(orderId: string): Promise<ActionResult> {
    console.log('📦 confirmPartArrival iniciado:', { orderId })

    try {
        // 1. Validar orderId
        if (!orderId || orderId.length < 10) {
            return { success: false, message: 'ID da OS inválido' }
        }

        // 2. Criar cliente Supabase
        const supabase = await createClient()

        // 3. Atualizar ordem
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'in_progress',
                part_arrival_date: new Date().toISOString(),
            })
            .eq('id', orderId)
            .eq('status', 'waiting_parts')

        if (updateError) {
            console.error('❌ Erro ao confirmar chegada:', updateError)
            return { success: false, message: `Erro: ${updateError.message}` }
        }

        // 4. Atualizar status das peças para 'arrived'
        await supabase
            .from('order_items')
            .update({ part_status: 'arrived' })
            .eq('order_id', orderId)
            .or('type.eq.part_external,is_external_part.eq.true')

        // 5. Revalidar caches
        revalidatePath('/dashboard/orders')
        revalidatePath(`/dashboard/orders/${orderId}`)
        revalidatePath(`/os/${orderId}`)

        console.log('🎉 confirmPartArrival SUCESSO!')
        return {
            success: true,
            message: '✅ Chegada da peça confirmada! OS movida para "Em Reparo".'
        }

    } catch (error) {
        console.error('❌ confirmPartArrival erro:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Server Action: Finalizar OS com Pagamento Manual
// ==================================================
export async function finishOrderWithPayment(
    orderId: string,
    amountReceived: number,
    paymentMethod: 'pix' | 'cash' | 'card_machine'
): Promise<ActionResult> {
    console.log('💰 finishOrderWithPayment iniciado:', { orderId, amountReceived, paymentMethod })

    try {
        // 1. Validar inputs
        if (!orderId || orderId.length < 10) {
            return { success: false, message: 'ID da OS inválido' }
        }

        if (amountReceived < 0) {
            return { success: false, message: 'Valor inválido' }
        }

        if (!['pix', 'cash', 'card_machine'].includes(paymentMethod)) {
            return { success: false, message: 'Método de pagamento inválido' }
        }

        // 2. Criar cliente Supabase
        const supabase = await createClient()

        // 3. Buscar dados atuais da loja para Snapshot (Imutabilidade)
        const { data: tenant } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', (await supabase.auth.getUser()).data.user?.id)
            .single()

        const storeSnapshot = tenant ? {
            trade_name: tenant.trade_name,
            legal_document: tenant.legal_document,
            phone: tenant.phone,
            logo_url: tenant.logo_url,
            warranty_days_labor: tenant.warranty_days,
            address: tenant.address
        } : null

        // 4. Atualizar ordem com dados do pagamento e SNAPSHOT
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'finished',
                payment_method: paymentMethod,
                amount_received: amountReceived,
                payment_received_at: new Date().toISOString(),
                finished_at: new Date().toISOString(),
                store_snapshot: storeSnapshot, // SALVA O SNAPSHOT
            })
            .eq('id', orderId)
            .in('status', ['in_progress', 'ready'])

        if (updateError) {
            console.error('❌ Erro ao finalizar OS:', updateError)
            return { success: false, message: `Erro: ${updateError.message}` }
        }

        // 4. Revalidar caches
        revalidatePath('/dashboard/orders')
        revalidatePath(`/dashboard/orders/${orderId}`)
        revalidatePath(`/os/${orderId}`)

        console.log('🎉 finishOrderWithPayment SUCESSO!')
        return {
            success: true,
            message: `✅ OS finalizada! Pagamento de R$ ${amountReceived.toFixed(2)} registrado via ${paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'cash' ? 'Dinheiro' : 'Maquininha'}.`
        }

    } catch (error) {
        console.error('❌ finishOrderWithPayment erro:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Server Action: Salvar Fotos de Evidência
// ==================================================
export async function saveEvidencePhotos(
    orderId: string,
    type: 'checkin' | 'checkout',
    photoUrls: string[]
): Promise<ActionResult> {
    console.log('📸 saveEvidencePhotos:', { orderId, type, count: photoUrls.length })

    try {
        if (!orderId || orderId.length < 10) {
            return { success: false, message: 'ID da OS inválido' }
        }

        const supabase = await createClient()

        // Definir qual coluna atualizar
        const updateData = type === 'checkin'
            ? { photos_checkin: photoUrls }
            : { photos_checkout: photoUrls }

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)

        if (error) {
            console.error('❌ Erro ao salvar fotos:', error)
            return { success: false, message: `Erro: ${error.message}` }
        }

        revalidatePath(`/dashboard/orders/${orderId}`)
        revalidatePath(`/os/${orderId}`)

        return {
            success: true,
            message: `✅ ${photoUrls.length} foto(s) de ${type === 'checkin' ? 'entrada' : 'saída'} salva(s)!`
        }

    } catch (error) {
        console.error('❌ saveEvidencePhotos erro:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Server Action: Buscar Métricas Financeiras (MEI Safe)
// ==================================================
export async function getMonthlyMetrics(): Promise<{
    success: boolean
    data?: {
        meiRevenue: number
        clientSavings: number
        totalReceived: number
        ordersCount: number
        avgTicket: number
        meiMonthlyLimit: number
        meiLimitPercent: number
    }
    message?: string
}> {
    console.log('📊 getMonthlyMetrics: Buscando métricas do mês')

    try {
        const supabase = await createClient()

        // Buscar OS finalizadas do mês atual
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { data: orders, error } = await supabase
            .from('orders')
            .select('labor_cost, parts_cost_external, amount_received')
            .eq('status', 'finished')
            .gte('finished_at', startOfMonth.toISOString())

        if (error) {
            console.error('❌ Erro ao buscar métricas:', error)
            return { success: false, message: `Erro: ${error.message}` }
        }

        // Calcular métricas
        const meiRevenue = orders?.reduce((sum, o) => sum + (o.labor_cost || 0), 0) || 0
        const clientSavings = orders?.reduce((sum, o) => sum + (o.parts_cost_external || 0), 0) || 0
        const totalReceived = orders?.reduce((sum, o) => sum + (o.amount_received || 0), 0) || 0
        const ordersCount = orders?.length || 0
        const avgTicket = ordersCount > 0 ? meiRevenue / ordersCount : 0

        // Limite MEI 2026 mensal (R$ 81k / 12)
        const meiMonthlyLimit = 6750
        const meiLimitPercent = meiMonthlyLimit > 0
            ? Math.round((meiRevenue / meiMonthlyLimit) * 100 * 10) / 10
            : 0

        return {
            success: true,
            data: {
                meiRevenue,
                clientSavings,
                totalReceived,
                ordersCount,
                avgTicket,
                meiMonthlyLimit,
                meiLimitPercent,
            }
        }

    } catch (error) {
        console.error('❌ getMonthlyMetrics erro:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Server Action: Buscar Cliente por CPF
// ==================================================
export async function getCustomerByCpf(cpf: string): Promise<{
    success: boolean
    data?: {
        name: string
        phone: string
        id: string
    }
    message?: string
}> {
    try {
        const cpfClean = cpf.replace(/\D/g, '')
        if (cpfClean.length < 11) {
            return { success: false, message: 'CPF incompleto' }
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, message: 'Usuário não autenticado' }

        const { data: customer, error } = await supabase
            .from('customers')
            .select('id, name, phone')
            .eq('document_id', cpfClean)
            .eq('user_id', user.id)
            .single()

        if (error || !customer) {
            return { success: false, message: 'Cliente não encontrado' }
        }

        return {
            success: true,
            data: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
            }
        }
    } catch (error) {
        console.error('Erro ao buscar cliente:', error)
        return { success: false, message: 'Erro ao buscar cliente' }
    }
}
// ==================================================
// Server Action: Excluir Ordem de Serviço
// ==================================================
export async function deleteOrder(orderId: string): Promise<ActionResult> {
    try {
        if (!orderId || orderId.length < 10) {
            return { success: false, message: 'ID inválido' }
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, message: 'Não autorizado' }

        // Deletar itens relacionados em cascade (se configurado no banco)
        // Se não tiver cascade, precisaríamos deletar order_items e order_logs manualmente.
        // Supabase geralmente requer deleção explícita se a FK não for ON DELETE CASCADE.
        // Vamos tentar deletar a ordem primeiro.

        // 1. Deletar itens (just in case)
        await supabase.from('order_items').delete().eq('order_id', orderId)
        await supabase.from('order_logs').delete().eq('order_id', orderId)

        // 2. Deletar a ordem
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Erro ao excluir:', error)
            return { success: false, message: `Erro ao excluir: ${error.message}` }
        }

        revalidatePath('/dashboard/orders')
        return { success: true, message: 'OS excluída com sucesso!' }
    } catch (error) {
        return { success: false, message: 'Erro inesperado ao excluir' }
    }
}
