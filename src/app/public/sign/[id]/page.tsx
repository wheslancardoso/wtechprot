import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import PublicSignContent from './sign-content'
import { notFound } from 'next/navigation'

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
            title: 'Assinatura | Pedido não encontrado',
        }
    }

    const { data: tenant } = await supabase
        .from('tenants')
        .select('trade_name')
        .eq('id', order.user_id)
        .single()

    const tradeName = tenant?.trade_name || 'Assistência Técnica'

    return {
        title: `Assinar Termo OS #${order.display_id} | ${tradeName}`,
        description: `Página de assinatura digital para a Ordem de Serviço #${order.display_id}.`,
    }
}

export default async function PublicSignPage({ params }: PageProps) {
    return <PublicSignContent />
}
