'use client'

import { useEffect, useRef, useCallback } from 'react'
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
    pollingInterval = 15000
}: OrderRealtimeListenerProps) {
    const router = useRouter()
    const { toast } = useToast()
    const supabaseRef = useRef(createClient())
    const hasSubscribed = useRef(false)

    const handleUpdate = useCallback(() => {
        router.refresh()
        toast({
            title: 'Atualização Recebida',
            description: 'Os dados da OS foram atualizados.',
        })
    }, [router, toast])

    useEffect(() => {
        const supabase = supabaseRef.current

        if (strategy === 'polling') {
            const interval = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    router.refresh()
                }
            }, pollingInterval)
            return () => clearInterval(interval)
        }

        // Evitar subscription duplicada
        if (hasSubscribed.current) return
        hasSubscribed.current = true

        // Strategy: Realtime com status monitoring
        const channelName = `order-detail-${orderId}`
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`,
                },
                (payload) => {
                    console.log('🔄 Realtime update recebido:', payload.new)
                    handleUpdate()
                }
            )
            .subscribe((status, err) => {
                console.log(`📡 Realtime [${channelName}]: ${status}`)
                if (err) {
                    console.error('❌ Realtime error:', err)
                }

                // Fallback: se não conseguir conectar ao realtime, usar polling
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.warn('⚠️ Realtime falhou, ativando polling fallback (30s)')
                    const fallbackInterval = setInterval(() => {
                        if (document.visibilityState === 'visible') {
                            router.refresh()
                        }
                    }, 30000)

                    // Cleanup do fallback quando o canal for removido
                    channel.unsubscribe().then(() => clearInterval(fallbackInterval))
                }
            })

        return () => {
            hasSubscribed.current = false
            supabase.removeChannel(channel)
        }
    }, [orderId, strategy, pollingInterval, router, handleUpdate])

    return null
}
