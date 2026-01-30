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
    acceptedTermsSnapshot: any[]
    hasParts: boolean
    signedName: string
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
        let clientIp = headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
            headersList.get('x-real-ip') ||
            headersList.get('cf-connecting-ip') || // Cloudflare
            'unknown'

        // Limpar prefixo IPv6 mapped se existir
        if (clientIp.startsWith('::ffff:')) {
            clientIp = clientIp.replace('::ffff:', '')
        }

        // 3. Montar metadados da assinatura digital (Evidence Log - Click Agreement)
        const evidencePayload = {
            method: "CLICK_WRAP_V1",
            accepted_at: new Date().toISOString(),
            ip_address: clientIp,
            device_fingerprint: signatureData?.userAgent || 'unknown',
            terms_version: "2026.1",
            metadata: {
                hasParts: signatureData?.hasParts || false,
                signedName: "Click Agreement (No Name)",
                acceptedTermsSnapshot: signatureData?.acceptedTermsSnapshot || [],
            }
        }

        // Gerar Hash de Integridade (SHA-256)
        // Isso cria uma "digital" única baseada nos dados exatos do momento
        const crypto = require('crypto')
        const integrityString = JSON.stringify(evidencePayload)
        const integrityHash = crypto.createHash('sha256').update(integrityString).digest('hex')

        const signatureEvidence = {
            ...evidencePayload,
            integrity_hash: integrityHash,
            geolocation: null,
        }
        console.log('📝 Signature evidence:', signatureEvidence)

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
                signature_evidence: signatureEvidence,
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
// ==================================================
// Server Action: Confirmar Chegada da Peça (Cliente)
// ==================================================
export async function confirmPartArrival(orderId: string): Promise<ActionResult> {
    console.log('📦 confirmPartArrival (public) iniciado:', { orderId })

    try {
        if (!orderId || orderId.length < 10) {
            return { success: false, message: 'ID da OS inválido' }
        }

        // 1. Criar cliente Supabase Admin (Bypass RLS)
        const supabase = await createAdminClient()

        // 2. Atualizar ordem
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'in_progress', // Move para Em Reparo
                part_arrival_date: new Date().toISOString(),
            })
            .eq('id', orderId)
            .eq('status', 'waiting_parts')

        if (updateError) {
            console.error('❌ Erro ao confirmar chegada:', updateError)
            return { success: false, message: `Erro ao confirmar: ${updateError.message}` }
        }

        // 3. Atualizar status das peças para 'arrived'
        await supabase
            .from('order_items')
            .update({ part_status: 'arrived' })
            .eq('order_id', orderId)
            .or('type.eq.part_external,is_external_part.eq.true')

        // 4. Capturar IP (Audit)
        const headersList = await headers()
        const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'

        // 5. Log de Auditoria
        await supabase.from('order_logs').insert({
            order_id: orderId,
            description: `Peças recebidas (Confirmado pelo Cliente via Link Público - IP: ${clientIp})`,
            type: 'status_change',
            created_at: new Date().toISOString()
        })

        // 6. Revalidar caches
        revalidatePath(`/os/${orderId}`)
        revalidatePath('/dashboard/orders')
        revalidatePath(`/dashboard/orders/${orderId}`)

        return {
            success: true,
            message: '✅ Recebimento confirmado! Redirecionando para agendamento...'
        }

    } catch (error) {
        console.error('❌ confirmPartArrival erro:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}
