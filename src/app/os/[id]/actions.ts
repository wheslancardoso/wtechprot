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
            previous_status: 'waiting_parts',
            new_status: 'in_progress',
            changed_by_type: 'customer',
            metadata: {
                reason: `Peças recebidas (Confirmado pelo Cliente via Link Público - IP: ${clientIp})`
            },
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

// ==================================================
// Server Action: Assinar Termo de Custódia (Home Care)
// ==================================================
interface CustodySignatureData {
    accessories: string[]
    conditions: string
    signatureUrl: string | null // URL do Supabase Storage ou Null (Click-Wrap)
    geolocation: {
        lat: number
        lng: number
    }
}

export async function signCustodyTerm(
    orderId: string,
    data: CustodySignatureData
): Promise<ActionResult> {
    console.log('✍️ signCustodyTerm iniciado:', { orderId })

    try {
        if (!orderId) return { success: false, message: 'ID da OS inválido' }

        // 1. Capturar Metadados de Auditoria
        const headersList = await headers()
        let clientIp = headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
            headersList.get('x-real-ip') || 'unknown'
        if (clientIp.startsWith('::ffff:')) clientIp = clientIp.replace('::ffff:', '')

        const userAgent = headersList.get('user-agent') || 'unknown'

        // 1.5 Verificar se já foi assinado (Idempotência)
        const supabaseCheck = await createAdminClient()
        const { data: currentOrder } = await supabaseCheck
            .from('orders')
            .select('custody_signed_at, status')
            .eq('id', orderId)
            .single()

        if (currentOrder?.custody_signed_at) {
            console.log('⚠️ Termo já assinado anteriormente. Ignorando.', orderId)
            return { success: true, message: 'Termo já foi assinado anteriormente.' }
        }

        // 2. Montar Payload de Evidência para Hash
        // IMPORTANTE: A ordem dos campos deve ser consistente para validar o hash depois
        const evidencePayload = {
            method: "DIGITAL_BADGE_V1", // Digital Badge = Geolocation + IP + Consent Check
            signed_at: new Date().toISOString(),
            order_id: orderId,
            ip_address: clientIp,
            device_fingerprint: userAgent,
            geolocation: {
                lat: data.geolocation.lat,
                lng: data.geolocation.lng
            },
            content_summary: {
                accessories: data.accessories.sort(), // Ordenar para consistência
                conditions_hash: require('crypto').createHash('md5').update(data.conditions || '').digest('hex'),
                signature_image_url: data.signatureUrl || 'DIGITAL_ACK'
            }
        }

        // 3. Gerar Hash de Integridade (SHA-256)
        const crypto = require('crypto')
        const integrityString = JSON.stringify(evidencePayload)
        const integrityHash = crypto.createHash('sha256').update(integrityString).digest('hex')

        console.log('🔒 Integrity Hash generated:', integrityHash)

        // 4. Salvar no Banco (Admin Client para garantir permissão de escrita em campos restritos)
        const supabase = await createAdminClient()

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                accessories_received: data.accessories,
                custody_conditions: data.conditions,
                custody_signature_url: data.signatureUrl,
                custody_signed_at: evidencePayload.signed_at,
                custody_ip: clientIp, // Save IP explicitly
                custody_geo_lat: data.geolocation.lat,
                custody_geo_lng: data.geolocation.lng,
                custody_integrity_hash: integrityHash,
                status: 'analyzing' // Move para Em Análise
            })
            .eq('id', orderId) // Importante: Assegurar que estamos alterando a OS correta (pelo DisplayID ou UUID, o chamador deve passar UUID)

        if (updateError) {
            console.error('❌ Erro ao salvar custódia:', updateError)
            return { success: false, message: `Erro ao salvar: ${updateError.message}` }
        }

        // 5. Log de Auditoria
        await supabase.from('order_logs').insert({
            order_id: orderId,
            previous_status: 'open',
            new_status: 'analyzing',
            changed_by_type: 'customer',
            metadata: {
                reason: `Custódia assinada (Click-Wrap). Hash: ${integrityHash.substring(0, 8)}...`
            },
            created_at: new Date().toISOString()
        })

        // 6. Revalidar
        revalidatePath(`/dashboard/orders/${orderId}`)

        return {
            success: true,
            message: '✅ Termo assinado e equipamento registrado com sucesso!'
        }

    } catch (error) {
        console.error('❌ signCustodyTerm erro:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Server Action: Salvar Dados do Check-in (Pré-Assinatura)
// ==================================================
interface CheckinData {
    accessories: string[]
    conditions: string
    photos: { label: string; url: string }[]
}

export async function saveCheckinData(
    orderId: string,
    data: CheckinData
): Promise<ActionResult> {
    console.log('💾 saveCheckinData iniciado:', { orderId })

    try {
        if (!orderId) return { success: false, message: 'ID da OS inválido' }

        const supabase = await createAdminClient()

        // Salvar apenas os dados de custódia preliminares
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                accessories_received: data.accessories,
                custody_conditions: data.conditions,
                custody_photos: data.photos, // Save photos JSON
            })
            .eq('id', orderId)

        if (updateError) {
            console.error('❌ Erro ao salvar check-in:', updateError)
            return { success: false, message: `Erro ao salvar: ${updateError.message}` }
        }

        revalidatePath(`/dashboard/orders/${orderId}`)

        return {
            success: true,
            message: 'Dados salvos! Redirecionando para assinatura...'
        }
    } catch (error) {
        console.error('❌ saveCheckinData erro:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}
