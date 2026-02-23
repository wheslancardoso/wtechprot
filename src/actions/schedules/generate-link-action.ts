'use server'

import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'

export type GenerateLinkResult = {
    success: boolean
    link?: string
    token?: string
    error?: string
}

interface GenerateLinkParams {
    customerId?: string
    orderId?: string
    customerName?: string
    customerPhone?: string
    notes?: string
}

import { headers } from 'next/headers'

export async function generateScheduleLink(params: GenerateLinkParams): Promise<GenerateLinkResult> {
    try {
        const supabase = await createClient()

        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: 'Não autenticado.' }
        }

        // Buscar configurações do técnico para definir validade do token
        const { data: settings } = await supabase
            .from('schedule_settings')
            .select('token_expiry_hours')
            .eq('user_id', user.id)
            .single()

        const expiryHours = settings?.token_expiry_hours ?? 48

        // Gerar token único e mais curto (12 caracteres hexadecimais)
        const token = randomBytes(6).toString('hex')

        // Calcular data de expiração
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + expiryHours)

        // Inserir agendamento pendente
        const { error: insertError } = await supabase
            .from('schedules')
            .insert({
                user_id: user.id,
                customer_id: params.customerId || null,
                order_id: params.orderId || null,
                token,
                status: 'pending',
                customer_name: params.customerName || null,
                customer_phone: params.customerPhone || null,
                notes: params.notes || null,
                expires_at: expiresAt.toISOString(),
            })

        if (insertError) {
            console.error('Erro ao criar agendamento:', insertError)
            return { success: false, error: 'Erro ao gerar link de agendamento.' }
        }

        // Montar URL detectando o domínio atual
        const headersList = await headers()
        const host = headersList.get('host') || 'wfixtech.com.br'
        const protocol = host.includes('localhost') ? 'http' : 'https'

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
        const link = `${baseUrl}/agendar/${token}`

        revalidatePath('/dashboard/agenda')

        return { success: true, link, token }
    } catch (err) {
        console.error('Erro inesperado generateScheduleLink:', err)
        return { success: false, error: 'Erro interno. Tente novamente.' }
    }
}
