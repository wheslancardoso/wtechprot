'use server'

import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

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

        // Gerar token único
        const token = randomBytes(32).toString('hex')

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

        // Montar URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
        const link = `${baseUrl}/agendar/${token}`

        return { success: true, link, token }
    } catch (err) {
        console.error('Erro inesperado generateScheduleLink:', err)
        return { success: false, error: 'Erro interno. Tente novamente.' }
    }
}
