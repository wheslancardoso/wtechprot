'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { createHash } from 'crypto'
import { revalidatePath } from 'next/cache'

// ==================================================
// Tipos
// ==================================================
interface SignatureMetadata {
    ip: string
    user_agent: string
    geo?: {
        lat: number
        lng: number
        accuracy: number
    }
    geo_denied?: boolean
    timestamp: string
    timezone: string
}

interface ApproveWithSignatureParams {
    orderId: string
    geo?: {
        lat: number
        lng: number
        accuracy: number
    } | null
    geoDenied?: boolean
}

// ==================================================
// Gerar Hash de Integridade (SHA-256)
// ==================================================
function generateIntegrityHash(
    orderId: string,
    timestamp: string,
    totalValue: number,
    ip: string
): string {
    const data = `${orderId}|${timestamp}|${totalValue}|${ip}`
    return createHash('sha256').update(data).digest('hex').toUpperCase()
}

// ==================================================
// Capturar IP do Cliente
// ==================================================
async function getClientIp(): Promise<string> {
    const headersList = await headers()

    // Tentar diferentes headers (ordem de prioridade)
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const cfConnectingIp = headersList.get('cf-connecting-ip')

    if (forwardedFor) {
        // x-forwarded-for pode ter múltiplos IPs, pegar o primeiro
        return forwardedFor.split(',')[0].trim()
    }

    return cfConnectingIp || realIp || 'unknown'
}

// ==================================================
// Capturar User-Agent
// ==================================================
async function getUserAgent(): Promise<string> {
    const headersList = await headers()
    return headersList.get('user-agent') || 'unknown'
}

// ==================================================
// Aprovar Orçamento com Assinatura Digital Blindada
// ==================================================
export async function approveBudgetWithSignature(
    params: ApproveWithSignatureParams
): Promise<{ success: boolean; message: string; hash?: string }> {
    try {
        const supabase = await createClient()
        const { orderId, geo, geoDenied } = params

        // Capturar metadados do servidor
        const ip = await getClientIp()
        const userAgent = await getUserAgent()
        const timestamp = new Date().toISOString()

        // Buscar dados da OS para o hash
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('labor_cost, parts_cost_external')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) {
            return { success: false, message: 'Ordem não encontrada' }
        }

        const totalValue = (order.labor_cost || 0) + (order.parts_cost_external || 0)

        // Gerar hash de integridade
        const integrityHash = generateIntegrityHash(orderId, timestamp, totalValue, ip)

        // Montar metadados da assinatura
        const signatureMetadata: SignatureMetadata = {
            ip,
            user_agent: userAgent,
            timestamp,
            timezone: 'America/Sao_Paulo',
        }

        if (geo) {
            signatureMetadata.geo = geo
        }

        if (geoDenied) {
            signatureMetadata.geo_denied = true
        }

        // Atualizar ordem com assinatura
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'waiting_parts', // ou 'in_progress' dependendo do fluxo
                signature_metadata: signatureMetadata,
                integrity_hash: integrityHash,
                approved_at: timestamp,
                updated_at: timestamp,
            })
            .eq('id', orderId)

        if (updateError) {
            console.error('Erro ao salvar assinatura:', updateError)
            return { success: false, message: updateError.message }
        }

        revalidatePath(`/dashboard/orders/${orderId}`)

        return {
            success: true,
            message: 'Orçamento aprovado com assinatura digital!',
            hash: integrityHash,
        }
    } catch (error) {
        console.error('Erro na aprovação:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

// ==================================================
// Verificar Integridade da Assinatura
// ==================================================
export async function verifySignatureIntegrity(
    orderId: string
): Promise<{ valid: boolean; message: string }> {
    try {
        const supabase = await createClient()

        const { data: order, error } = await supabase
            .from('orders')
            .select('labor_cost, parts_cost_external, signature_metadata, integrity_hash, approved_at')
            .eq('id', orderId)
            .single()

        if (error || !order) {
            return { valid: false, message: 'Ordem não encontrada' }
        }

        if (!order.signature_metadata || !order.integrity_hash) {
            return { valid: false, message: 'Ordem não possui assinatura digital' }
        }

        const metadata = order.signature_metadata as SignatureMetadata
        const totalValue = (order.labor_cost || 0) + (order.parts_cost_external || 0)

        // Recalcular hash
        const recalculatedHash = generateIntegrityHash(
            orderId,
            order.approved_at,
            totalValue,
            metadata.ip
        )

        if (recalculatedHash === order.integrity_hash) {
            return { valid: true, message: 'Assinatura válida e íntegra' }
        }

        return { valid: false, message: 'ALERTA: Hash não confere - possível adulteração!' }
    } catch (error) {
        return {
            valid: false,
            message: `Erro na verificação: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}
