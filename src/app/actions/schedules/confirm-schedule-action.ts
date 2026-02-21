'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendScheduleConfirmationAlert } from '@/lib/email'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type ConfirmScheduleResult = {
    success: boolean
    error?: string
}

interface ConfirmParams {
    token: string
    selectedDate: string
    selectedTime: string
    customerName?: string
    customerPhone?: string
}

/**
 * Confirma o agendamento do cliente: grava data/hora escolhidos e marca como confirmado.
 * Usa adminClient (bypass RLS) porque o cliente não está autenticado.
 */
export async function confirmSchedule(params: ConfirmParams): Promise<ConfirmScheduleResult> {
    try {
        const supabase = await createAdminClient()

        // 1. Buscar agendamento pelo token
        const { data: schedule, error: fetchError } = await supabase
            .from('schedules')
            .select('*')
            .eq('token', params.token)
            .single()

        if (fetchError || !schedule) {
            return { success: false, error: 'Link de agendamento inválido.' }
        }

        // Verificar expiração
        if (new Date(schedule.expires_at) < new Date()) {
            return { success: false, error: 'Este link expirou. Solicite um novo ao técnico.' }
        }

        // Verificar se já foi confirmado
        if (schedule.status === 'confirmed') {
            return { success: false, error: 'Este agendamento já foi confirmado anteriormente.' }
        }

        if (schedule.status === 'canceled') {
            return { success: false, error: 'Este agendamento foi cancelado.' }
        }

        // 2. Verificar se o horário ainda está disponível (double-check concorrência)
        const { data: conflict } = await supabase
            .from('schedules')
            .select('id')
            .eq('user_id', schedule.user_id)
            .eq('scheduled_date', params.selectedDate)
            .eq('scheduled_time', params.selectedTime)
            .eq('status', 'confirmed')
            .maybeSingle()

        if (conflict) {
            return { success: false, error: 'Este horário acabou de ser reservado por outra pessoa. Escolha outro horário.' }
        }

        // 3. Confirmar agendamento
        const { error: updateError } = await supabase
            .from('schedules')
            .update({
                scheduled_date: params.selectedDate,
                scheduled_time: params.selectedTime,
                customer_name: params.customerName || schedule.customer_name,
                customer_phone: params.customerPhone || schedule.customer_phone,
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
            })
            .eq('id', schedule.id)

        if (updateError) {
            console.error('Erro ao confirmar agendamento:', updateError)
            return { success: false, error: 'Erro ao processar confirmação. Tente contatar o técnico diretamente.' }
        }

        // ===================================
        // Disparo de Alerta Assíncrono (Resend)
        // ===================================
        const dateParsed = schedule.scheduled_date ? format(parseISO(schedule.scheduled_date), "dd/MM/yyyy", { locale: ptBR }) : ''
        const timeParsed = schedule.scheduled_time?.substring(0, 5) ?? ''

        // Fire and forget (não seguramos a requisição do usuário esperando o email ser enviado)
        void sendScheduleConfirmationAlert({
            customerName: schedule.customer_name ?? 'Cliente Anônimo',
            customerPhone: schedule.customer_phone ?? 'Não informado',
            scheduledDate: dateParsed,
            scheduledTime: timeParsed,
            serviceNotes: schedule.notes
        })

        // Atualiza a visão do técnico
        revalidatePath('/dashboard/agenda')
        // Invalida a URL pública do link gerado pra evitar que a Vercel continue exibindo a tela de confirmação após recarregar a página.
        revalidatePath(`/agendar/${schedule.token}`)

        return { success: true }
    } catch (err) {
        console.error('Erro inesperado confirmSchedule:', err)
        return { success: false, error: 'Erro interno. Tente novamente.' }
    }
}
