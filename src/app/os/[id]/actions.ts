'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

// ==================================================
// Tipos
// ==================================================
type ActionResult = {
    success: boolean
    message: string
}

interface SignatureData {
    userAgent: string
    timestamp: string
    acceptedTerms: boolean
    hasParts: boolean
}

// ==================================================
// Server Action: Aprovar Orçamento (Compra Assistida)
// ==================================================
export async function approveBudget(
    orderId: string,
    signatureData?: SignatureData
): Promise<ActionResult> {
    console.log('🟢 approveBudget iniciado:', { orderId, signatureData })

    try {
        // 1. Validar orderId
        if (!orderId || orderId.length < 10) {
            return { success: false, message: 'ID da OS inválido' }
        }

        // 2. Capturar IP do cliente (via headers)
        const headersList = await headers()
        const clientIp = headersList.get('x-forwarded-for') ||
            headersList.get('x-real-ip') ||
            'unknown'

        // 3. Montar metadados da assinatura digital
        const signatureMetadata = {
            ip: clientIp,
            userAgent: signatureData?.userAgent || 'unknown',
            timestamp: signatureData?.timestamp || new Date().toISOString(),
            acceptedTerms: signatureData?.acceptedTerms || false,
            hasParts: signatureData?.hasParts || false,
            approvedAt: new Date().toISOString(),
        }
        console.log('📝 Signature metadata:', signatureMetadata)

        // 4. Criar cliente Supabase (admin para bypass RLS)
        const supabase = await createAdminClient()

        // 5. Buscar itens da OS para verificar se tem peças externas
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('id, type, is_external_part')
            .eq('order_id', orderId)

        if (itemsError) {
            console.error('❌ Erro ao buscar itens:', itemsError)
        }

        // 6. Verificar se existe algum item do tipo 'part_external' ou is_external_part = true
        const hasExternalParts = orderItems?.some(
            item => item.type === 'part_external' || item.is_external_part === true
        ) || false
        console.log('📦 Tem peças externas?', hasExternalParts)

        // 7. Definir novo status baseado na lógica de negócio
        // PIVOT: NÃO capturamos pagamento, apenas mudamos status
        // SE TIVER PEÇAS: waiting_parts (técnico espera a peça chegar)
        // SE NÃO TIVER: in_progress (técnico pode começar direto)
        const newStatus = hasExternalParts ? 'waiting_parts' : 'in_progress'
        console.log('📝 Novo status:', newStatus)

        // 8. Atualizar ordem com assinatura digital
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                approved_at: new Date().toISOString(),
                signature_metadata: signatureMetadata,
            })
            .eq('id', orderId)
            .eq('status', 'waiting_approval')

        if (updateError) {
            console.error('❌ Erro ao aprovar:', updateError)
            return { success: false, message: `Erro ao aprovar: ${updateError.message}` }
        }

        // 9. Atualizar status das peças para 'ordered' se houver peças externas
        if (hasExternalParts && orderItems) {
            const externalPartIds = orderItems
                .filter(item => item.type === 'part_external' || item.is_external_part)
                .map(item => item.id)

            if (externalPartIds.length > 0) {
                await supabase
                    .from('order_items')
                    .update({ part_status: 'ordered' })
                    .in('id', externalPartIds)
            }
        }

        // 10. Revalidar caches
        revalidatePath(`/os/${orderId}`)
        revalidatePath('/dashboard/orders')
        revalidatePath(`/dashboard/orders/${orderId}`)

        // 11. Mensagem de sucesso
        const successMessage = hasExternalParts
            ? '✅ Orçamento aprovado! Compre as peças nos links indicados e entregue na assistência.'
            : '✅ Orçamento aprovado! O técnico já vai iniciar o reparo.'

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
            .eq('status', 'waiting_approval')

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
            message: '❌ Orçamento reprovado. A OS foi cancelada.'
        }

    } catch (error) {
        console.error('❌ rejectBudget erro inesperado:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}
