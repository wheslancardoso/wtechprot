'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface OrderRealtimeListenerProps {
    orderId: string
}

export default function OrderRealtimeListener({ orderId }: OrderRealtimeListenerProps) {
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel(`order-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`,
                },
                (payload) => {
                    console.log('Realtime update received:', payload)
                    router.refresh()

                    toast({
                        title: 'Atualização Recebida',
                        description: 'Os dados do pedido foram atualizados.',
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [orderId, router, supabase, toast])

    return null // Componente invisível (apenas lógica)
}
