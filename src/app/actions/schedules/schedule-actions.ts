'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Schedule, ScheduleSettings } from '@/types/database'

// ==================================================
// Buscar agendamentos do técnico
// ==================================================
export async function getSchedules(): Promise<Schedule[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true })

    if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        return []
    }

    return data ?? []
}

// ==================================================
// Cancelar agendamento
// ==================================================
export async function cancelSchedule(scheduleId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autenticado.' }

    const { error } = await supabase
        .from('schedules')
        .update({ status: 'canceled' })
        .eq('id', scheduleId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Erro ao cancelar agendamento:', error)
        return { success: false, error: 'Erro ao cancelar agendamento.' }
    }

    revalidatePath('/dashboard/agenda')
    return { success: true }
}

// ==================================================
// Excluir agendamento
// ==================================================
export async function deleteSchedule(scheduleId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autenticado.' }

    const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Erro ao excluir agendamento:', error)
        return { success: false, error: 'Erro ao excluir agendamento.' }
    }

    revalidatePath('/dashboard/agenda')
    return { success: true }
}

// ==================================================
// Buscar configurações de horário
// ==================================================
export async function getScheduleSettings(): Promise<ScheduleSettings | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('schedule_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao buscar configurações:', error)
    }

    return data ?? null
}

// ==================================================
// Salvar configurações de horário
// ==================================================
export async function saveScheduleSettings(
    settings: Partial<Omit<ScheduleSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autenticado.' }

    // Tentar atualizar primeiro (upsert manual)
    const { data: existing } = await supabase
        .from('schedule_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (existing) {
        const { error } = await supabase
            .from('schedule_settings')
            .update(settings)
            .eq('user_id', user.id)

        if (error) {
            console.error('Erro ao atualizar configurações:', error)
            return { success: false, error: 'Erro ao salvar configurações.' }
        }
    } else {
        const { error } = await supabase
            .from('schedule_settings')
            .insert({
                user_id: user.id,
                ...settings,
            })

        if (error) {
            console.error('Erro ao criar configurações:', error)
            return { success: false, error: 'Erro ao salvar configurações.' }
        }
    }

    revalidatePath('/dashboard/agenda')
    return { success: true }
}

// ==================================================
// Atualizar dados do cliente no agendamento
// ==================================================
export async function updateScheduleCustomer(
    scheduleId: string,
    customerName: string,
    customerPhone: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autenticado.' }

    const { error } = await supabase
        .from('schedules')
        .update({ customer_name: customerName, customer_phone: customerPhone })
        .eq('id', scheduleId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Erro ao atualizar agendamento:', error)
        return { success: false, error: 'Erro ao salvar.' }
    }

    revalidatePath('/dashboard/agenda')
    return { success: true }
}
