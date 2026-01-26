'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

// ==================================================
// Tipo de retorno padrão
// ==================================================
type ActionResult = {
    success: boolean
    message: string
}

// ==================================================
// Server Action: Aprovar Orçamento
// ==================================================
export async function approveBudget(orderId: string): Promise<ActionResult> {
    console.log('🟢 approveBudget iniciado:', { orderId })

    try {
        // 1. Validar orderId
        if (!orderId || orderId.length < 10) {
            return { success: false, message: 'ID da OS inválido' }
        }

        // 2. Criar cliente Supabase (admin para bypass RLS)
        const supabase = await createAdminClient()

        // 3. Buscar itens da OS para verificar se tem peças externas
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('id, type')
            .eq('order_id', orderId)

        if (itemsError) {
            console.error('❌ Erro ao buscar itens:', itemsError)
            // Continua mesmo sem itens
        }

        // 4. Verificar se existe algum item do tipo 'part_external'
        const hasExternalParts = orderItems?.some(item => item.type === 'part_external') || false
        console.log('📦 Tem peças externas?', hasExternalParts)

        // 5. Definir novo status baseado na lógica de negócio
        // SE TIVER PEÇAS: waiting_parts (técnico espera a peça chegar)
        // SE NÃO TIVER: in_progress (técnico pode começar direto)
        const newStatus = hasExternalParts ? 'waiting_parts' : 'in_progress'
        console.log('📝 Novo status:', newStatus)

        // 6. Atualizar ordem
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                approved_at: new Date().toISOString(),
            })
            .eq('id', orderId)
            .eq('status', 'waiting_approval') // Só atualiza se estiver aguardando aprovação

        if (updateError) {
            console.error('❌ Erro ao aprovar:', updateError)
            return { success: false, message: `Erro ao aprovar: ${updateError.message}` }
        }

        // 7. Revalidar caches
        revalidatePath(`/os/${orderId}`)
        revalidatePath('/dashboard/orders')
        revalidatePath(`/dashboard/orders/${orderId}`)

        // 8. Mensagem de sucesso
        const successMessage = hasExternalParts
            ? 'Orçamento aprovado! Compre as peças nos links indicados e entregue na assistência.'
            : 'Orçamento aprovado! O técnico já vai iniciar o reparo.'

        console.log('🎉 approveBudget SUCESSO!')
        return { success: true, message: successMessage }

    } catch (error) {
        console.error('❌ approveBudget erro inesperado:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Server Action: Reprovar Orçamento
// ==================================================
export async function rejectBudget(orderId: string): Promise<ActionResult> {
    console.log('🔴 rejectBudget iniciado:', { orderId })

    try {
        // 1. Validar orderId
        if (!orderId || orderId.length < 10) {
            return { success: false, message: 'ID da OS inválido' }
        }

        // 2. Criar cliente Supabase (admin para bypass RLS)
        const supabase = await createAdminClient()

        // 3. Atualizar ordem para cancelada
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'canceled',
                canceled_at: new Date().toISOString(),
            })
            .eq('id', orderId)
            .eq('status', 'waiting_approval') // Só atualiza se estiver aguardando aprovação

        if (updateError) {
            console.error('❌ Erro ao reprovar:', updateError)
            return { success: false, message: `Erro ao reprovar: ${updateError.message}` }
        }

        // 4. Revalidar caches
        revalidatePath(`/os/${orderId}`)
        revalidatePath('/dashboard/orders')
        revalidatePath(`/dashboard/orders/${orderId}`)

        console.log('🎉 rejectBudget SUCESSO!')
        return {
            success: true,
            message: 'Orçamento reprovado. A OS foi cancelada.'
        }

    } catch (error) {
        console.error('❌ rejectBudget erro inesperado:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}
