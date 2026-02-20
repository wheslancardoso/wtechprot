import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import CheckinContent from './checkin-content'

interface PageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const supabase = await createAdminClient()

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let query = supabase.from('orders').select('display_id, user_id').single()

    if (isUuid) {
        query = supabase.from('orders').select('display_id, user_id').eq('id', id).single()
    } else {
        query = supabase.from('orders').select('display_id, user_id').eq('display_id', id).single()
    }

    const { data: order } = await query

    if (!order) {
        return {
            title: 'Ordem de Serviço não encontrada',
        }
    }

    const { data: tenant } = await supabase
        .from('tenants')
        .select('trade_name')
        .eq('id', order.user_id)
        .single()

    const tradeName = tenant?.trade_name || 'Soluções em Tecnologia'

    return {
        title: `Check-in OS #${order.display_id} | ${tradeName}`,
        description: `Check-in técnico para ordem de serviço #${order.display_id}.`,
    }
}

export default async function CheckinPage({ params }: PageProps) {
    return <CheckinContent params={params} />
}
