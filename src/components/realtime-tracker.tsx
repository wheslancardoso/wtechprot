'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ExecutionTask } from '@/lib/execution-tasks-types'
import { CheckCircle2, Circle, Loader2, Wifi, WifiOff, Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface RealtimeTrackerProps {
    orderId: string
    initialTasks: ExecutionTask[]
}

// Helper para formatar data e hora (Client-side usage only)
function formatDateTime(dateString: string | null) {
    if (!dateString) return null
    const date = new Date(dateString)
    return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
}

// Intervalo de fallback caso o realtime falhe (60s em vez de 4s)
const FALLBACK_POLLING_INTERVAL = 60000

export default function RealtimeTracker({ orderId, initialTasks }: RealtimeTrackerProps) {
    const [tasks, setTasks] = useState<ExecutionTask[]>(initialTasks)
    const [isConnected, setIsConnected] = useState(false)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [mounted, setMounted] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const supabaseRef = useRef(createClient())

    // Evitar hydration mismatch
    useEffect(() => {
        setMounted(true)
        setLastUpdate(new Date())
    }, [])

    // Fetch manual (usado apenas como fallback)
    const fetchTasks = useCallback(async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}/tasks?t=${Date.now()}`)
            const data = await res.json()

            if (res.ok && data.tasks) {
                setTasks((prev) => {
                    const newTasks = data.tasks
                    return JSON.stringify(prev) !== JSON.stringify(newTasks) ? newTasks : prev
                })
                setLastUpdate(new Date())
            }
        } catch (error) {
            console.error('Erro ao buscar tarefas (fallback):', error)
        }
    }, [orderId])

    // Supabase Realtime + Fallback Polling
    useEffect(() => {
        const supabase = supabaseRef.current
        let fallbackInterval: ReturnType<typeof setInterval> | null = null

        const channelName = `tracker-${orderId}`
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
                    console.log('🔄 Tracker: update recebido via realtime')
                    const newRecord = payload.new as { execution_tasks?: ExecutionTask[] }

                    if (newRecord.execution_tasks) {
                        // Flash de animação ao receber update
                        setIsAnimating(true)
                        setTimeout(() => setIsAnimating(false), 1500)

                        setTasks(newRecord.execution_tasks)
                        setLastUpdate(new Date())
                    }
                }
            )
            .subscribe((status, err) => {
                console.log(`📡 Tracker [${channelName}]: ${status}`)

                if (status === 'SUBSCRIBED') {
                    setIsConnected(true)
                    // Uma vez conectado, não precisa de polling
                    if (fallbackInterval) {
                        clearInterval(fallbackInterval)
                        fallbackInterval = null
                    }
                }

                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.warn('⚠️ Tracker: realtime falhou, ativando polling fallback (60s)')
                    setIsConnected(false)
                    // Ativar polling apenas se o realtime falhar
                    if (!fallbackInterval) {
                        fallbackInterval = setInterval(() => {
                            if (document.visibilityState === 'visible') {
                                fetchTasks()
                            }
                        }, FALLBACK_POLLING_INTERVAL)
                    }
                }

                if (err) {
                    console.error('❌ Tracker error:', err)
                    setIsConnected(false)
                }
            })

        return () => {
            if (fallbackInterval) clearInterval(fallbackInterval)
            supabase.removeChannel(channel)
        }
    }, [orderId, fetchTasks])

    // Calcular progresso
    const completedCount = tasks.filter((t) => t.completed).length
    const totalCount = tasks.length
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    if (!mounted) {
        return null
    }

    return (
        <Card className="border-primary/20 shadow-md overflow-hidden relative">
            {/* Background Pulse Effect on Update */}
            <div
                className={`absolute inset-0 bg-primary/5 pointer-events-none transition-opacity duration-1000 ${isAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            <CardHeader className="bg-primary/5 pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            {isConnected ? (
                                <Wifi className="h-4 w-4 text-green-500" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            Acompanhamento ao Vivo
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs">
                            <span className="relative flex h-2 w-2">
                                {isConnected ? (
                                    <>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </>
                                ) : (
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                )}
                            </span>
                            {isConnected
                                ? 'Conectado — Atualização automática'
                                : lastUpdate
                                    ? `Verificando a cada 60s — Última: ${lastUpdate.toLocaleTimeString()}`
                                    : 'Conectando...'
                            }
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-background font-mono">
                        {completedCount}/{totalCount}
                    </Badge>
                </div>

                {totalCount > 0 && (
                    <div className="space-y-1 mt-4">
                        <Progress value={progress} className="h-2 transition-all duration-1000" />
                        <p className="text-xs text-right text-muted-foreground pt-1">
                            {Math.round(progress)}% concluído
                        </p>
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0 relative z-10">
                {tasks.length === 0 ? (
                    <div className="p-8 text-center bg-muted/30">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Aguardando início dos trabalhos...
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {tasks.map((task, index) => {
                            const timestamp = formatDateTime(task.completed_at)

                            return (
                                <div
                                    key={task.id || index}
                                    className={`flex items-start gap-4 p-4 transition-all duration-500 ${task.completed
                                        ? 'bg-green-50/40 dark:bg-green-950/20'
                                        : 'bg-background hover:bg-muted/30'
                                        }`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {task.completed ? (
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20" />
                                                <CheckCircle2 className="relative h-6 w-6 text-green-600 dark:text-green-500 drop-shadow-sm transition-transform group-hover:scale-110" />
                                            </div>
                                        ) : (
                                            <Circle className="h-6 w-6 text-muted-foreground/30" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`font-medium text-base leading-none mb-1.5 ${task.completed
                                                ? 'text-green-800 dark:text-green-300'
                                                : 'text-foreground/80'
                                                }`}
                                        >
                                            {task.title || (task as any).label}
                                        </p>

                                        {task.completed ? (
                                            <div className="flex items-center gap-3 text-xs text-green-700/70 dark:text-green-400/70 animate-in fade-in slide-in-from-left-2 duration-500">
                                                {timestamp && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {timestamp.date}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {timestamp.time}
                                                        </span>
                                                    </>
                                                )}
                                                <span className="font-medium px-1.5 py-0.5 bg-green-100 dark:bg-green-900/50 rounded-full text-[10px] uppercase tracking-wider">
                                                    Finalizado
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                                                <Clock className="h-3 w-3" />
                                                Aguardando execução
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
