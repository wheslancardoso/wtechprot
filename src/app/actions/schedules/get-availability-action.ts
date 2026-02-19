'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { format, addDays, parseISO } from 'date-fns'

export type AvailabilityResult = {
    success: boolean
    slots?: string[]       // Horários disponíveis para a data selecionada: ["09:00", "10:00", ...]
    availableDates?: string[] // Datas com vagas: ["2026-02-20", "2026-02-21", ...]
    scheduleInfo?: {
        customerName: string | null
        notes: string | null
        expiresAt: string
    }
    error?: string
}

/**
 * Busca horários disponíveis para uma data específica.
 * Usa adminClient (bypass RLS) porque o cliente não está autenticado.
 */
export async function getAvailability(
    token: string,
    selectedDate?: string
): Promise<AvailabilityResult> {
    try {
        const supabase = await createAdminClient()

        // 1. Validar token e buscar o agendamento
        const { data: schedule, error: scheduleError } = await supabase
            .from('schedules')
            .select('*')
            .eq('token', token)
            .single()

        if (scheduleError || !schedule) {
            return { success: false, error: 'Link de agendamento inválido ou não encontrado.' }
        }

        // Verificar se o token expirou
        if (new Date(schedule.expires_at) < new Date()) {
            return { success: false, error: 'Este link de agendamento expirou. Solicite um novo link.' }
        }

        // Verificar se já foi confirmado
        if (schedule.status === 'confirmed') {
            return { success: false, error: 'Este agendamento já foi confirmado.' }
        }

        if (schedule.status === 'canceled') {
            return { success: false, error: 'Este agendamento foi cancelado.' }
        }

        // 2. Buscar configurações do técnico
        const { data: settings } = await supabase
            .from('schedule_settings')
            .select('*')
            .eq('user_id', schedule.user_id)
            .single()

        // Configurações padrão se não achar
        const config = {
            workDays: settings?.work_days ?? [1, 2, 3, 4, 5],
            startTime: settings?.start_time ?? '09:00',
            endTime: settings?.end_time ?? '18:00',
            slotDuration: settings?.slot_duration_minutes ?? 60,
            lunchStart: settings?.lunch_start ?? '12:00',
            lunchEnd: settings?.lunch_end ?? '13:00',
            maxAdvanceDays: settings?.max_advance_days ?? 30,
        }

        // 3. Gerar datas disponíveis (dias úteis dentro do range)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const availableDates: string[] = []

        for (let i = 1; i <= config.maxAdvanceDays; i++) {
            const date = addDays(today, i)
            const dayOfWeek = date.getDay()
            if (config.workDays.includes(dayOfWeek)) {
                availableDates.push(format(date, 'yyyy-MM-dd'))
            }
        }

        // 4. Se uma data foi selecionada, calcular slots livres
        let slots: string[] = []
        if (selectedDate) {
            // Gerar todos os slots possíveis para o dia
            const allSlots = generateTimeSlots(
                config.startTime,
                config.endTime,
                config.slotDuration,
                config.lunchStart,
                config.lunchEnd
            )

            // Buscar agendamentos já confirmados para esta data e técnico
            const { data: existingSchedules } = await supabase
                .from('schedules')
                .select('scheduled_time')
                .eq('user_id', schedule.user_id)
                .eq('scheduled_date', selectedDate)
                .eq('status', 'confirmed')

            const bookedTimes = new Set(
                existingSchedules?.map(s => s.scheduled_time?.substring(0, 5)) ?? []
            )

            // Filtrar slots ocupados
            slots = allSlots.filter(slot => !bookedTimes.has(slot))

            // Se a data selecionada é hoje, filtrar horários que já passaram
            const selectedDateObj = parseISO(selectedDate)
            const now = new Date()
            if (
                selectedDateObj.getFullYear() === now.getFullYear() &&
                selectedDateObj.getMonth() === now.getMonth() &&
                selectedDateObj.getDate() === now.getDate()
            ) {
                const currentHour = now.getHours()
                const currentMinute = now.getMinutes()
                slots = slots.filter(slot => {
                    const [h, m] = slot.split(':').map(Number)
                    return h > currentHour || (h === currentHour && m > currentMinute)
                })
            }
        }

        return {
            success: true,
            slots,
            availableDates,
            scheduleInfo: {
                customerName: schedule.customer_name,
                notes: schedule.notes,
                expiresAt: schedule.expires_at,
            },
        }
    } catch (err) {
        console.error('Erro inesperado getAvailability:', err)
        return { success: false, error: 'Erro interno. Tente novamente.' }
    }
}

/**
 * Gera lista de horários baseado na configuração do técnico.
 */
function generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
    lunchStart: string | null,
    lunchEnd: string | null
): string[] {
    const slots: string[] = []

    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)

    let lunchStartMin = -1
    let lunchEndMin = -1

    if (lunchStart && lunchEnd) {
        const [lsH, lsM] = lunchStart.split(':').map(Number)
        const [leH, leM] = lunchEnd.split(':').map(Number)
        lunchStartMin = lsH * 60 + lsM
        lunchEndMin = leH * 60 + leM
    }

    let currentMin = startH * 60 + startM
    const endMin = endH * 60 + endM

    while (currentMin + slotDurationMinutes <= endMin) {
        // Verificar se o slot cai no horário de almoço
        if (
            lunchStartMin >= 0 &&
            currentMin < lunchEndMin &&
            currentMin + slotDurationMinutes > lunchStartMin
        ) {
            currentMin = lunchEndMin
            continue
        }

        const hours = Math.floor(currentMin / 60).toString().padStart(2, '0')
        const minutes = (currentMin % 60).toString().padStart(2, '0')
        slots.push(`${hours}:${minutes}`)

        currentMin += slotDurationMinutes
    }

    return slots
}
