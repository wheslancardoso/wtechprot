'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface OrderRealtimeListenerProps {
    orderId: string
    strategy?: 'realtime' | 'polling'
    pollingInterval?: number
}

export default function OrderRealtimeListener({
    orderId,
    strategy = 'realtime',
    pollingInterval = 15000 // Aumentado para 15s (Otimização Vercel)
}: OrderRealtimeListenerProps) {
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        if (strategy === 'polling') {
            const interval = setInterval(() => {
                // Só atualiza se a aba estiver visível para economizar recursos (Vercel Cotas)
                if (document.visibilityState === 'visible') {
                    router.refresh()
                }
            }, pollingInterval)
            return () => clearInterval(interval)
        }

        // Strategy: Realtime
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
    }, [orderId, router, supabase, toast, strategy, pollingInterval])

    return null
}
