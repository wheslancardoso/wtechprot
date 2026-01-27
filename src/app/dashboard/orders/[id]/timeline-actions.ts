'use server'

import { createClient } from '@/lib/supabase/server'

// ==================================================
// Tipo do Log de Ordem
// ==================================================
export interface OrderLog {
    id: string
    order_id: string
    previous_status: string | null
    new_status: string
    changed_by: string | null
    changed_by_type: 'technician' | 'customer' | 'system'
    metadata: Record<string, unknown>
    created_at: string
    formatted_date: string
}

// ==================================================
// Labels de Status
// ==================================================
const STATUS_LABELS: Record<string, string> = {
    open: 'OS Aberta',
    analyzing: 'Em Análise',
    waiting_approval: 'Aguardando Aprovação',
    waiting_parts: 'Aguardando Peças',
    in_progress: 'Em Reparo',
    ready: 'Pronta para Retirada',
    finished: 'Finalizada',
    canceled: 'Cancelada',
}

// ==================================================
// Server Action: Buscar Logs de Timeline
// ==================================================
export async function getOrderTimeline(orderId: string): Promise<{
    success: boolean
    data?: OrderLog[]
    message?: string
}> {
    try {
        const supabase = await createClient()

        // Buscar da view formatada (se existir) ou direto da tabela
        const { data: logs, error } = await supabase
            .from('order_logs')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Erro ao buscar timeline:', error)

            // Se a tabela não existe ainda, retornar vazio
            if (error.code === '42P01') {
                return { success: true, data: [] }
            }

            return { success: false, message: error.message }
        }

        // Formatar datas para horário de Brasília
        const formattedLogs: OrderLog[] = (logs || []).map(log => {
            const date = new Date(log.created_at)
            const formatted = date.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).replace(',', ' às')

            return {
                ...log,
                formatted_date: formatted,
            }
        })

        return { success: true, data: formattedLogs }
    } catch (error) {
        console.error('Erro inesperado:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Server Action: Inserir Log Manual
// ==================================================
export async function insertOrderLog(
    orderId: string,
    previousStatus: string | null,
    newStatus: string,
    metadata?: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase
            .from('order_logs')
            .insert({
                order_id: orderId,
                previous_status: previousStatus,
                new_status: newStatus,
                changed_by: user?.id || null,
                changed_by_type: 'technician',
                metadata: metadata || {},
            })

        if (error) {
            console.error('Erro ao inserir log:', error)
            return { success: false, message: error.message }
        }

        return { success: true, message: 'Log registrado' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}
