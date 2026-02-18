'use server'

import { createClient } from '@/lib/supabase/server'
import { OrderLog } from './orders/[id]/timeline-actions'

export interface ActivityLog extends OrderLog {
    order_display_id: number
    customer_name: string
}

export async function getGlobalActivityFeed(limit = 10): Promise<{
    success: boolean
    data?: ActivityLog[]
    message?: string
}> {
    try {
        const supabase = await createClient()

        // Fetch logs with order and customer details
        // Note: This assumes relations are set up correctly in Supabase
        const { data: logs, error } = await supabase
            .from('order_logs')
            .select(`
                *,
                order:orders (
                    display_id,
                    customer:customers (
                        name
                    )
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching activity feed:', error)
            return { success: false, message: error.message }
        }

        const formattedLogs: ActivityLog[] = logs.map((log: any) => {
            const date = new Date(log.created_at)
            const formatted = date.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            })

            return {
                ...log,
                order_display_id: log.order?.display_id,
                customer_name: log.order?.customer?.name || 'Cliente',
                formatted_date: formatted
            }
        })

        return { success: true, data: formattedLogs }

    } catch (error) {
        console.error('Unexpected error:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}
