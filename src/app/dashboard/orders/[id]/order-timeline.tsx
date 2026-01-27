'use client'

import { useEffect, useState } from 'react'
import { getOrderTimeline } from './timeline-actions'
import type { OrderLog } from './timeline-actions'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Icons
import {
    Clock,
    Play,
    FileSearch,
    FileCheck,
    Package,
    Wrench,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react'

// ==================================================
// Labels de Status (local helper)
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

function getStatusLabel(status: string): string {
    return STATUS_LABELS[status] || status
}

// ==================================================
// Mapeamento de ícones por status
// ==================================================
const STATUS_ICONS: Record<string, React.ElementType> = {
    open: Play,
    analyzing: FileSearch,
    waiting_approval: FileCheck,
    waiting_parts: Package,
    in_progress: Wrench,
    ready: CheckCircle,
    finished: CheckCircle,
    canceled: XCircle,
}

// ==================================================
// Cores por status
// ==================================================
const STATUS_COLORS: Record<string, string> = {
    open: 'bg-blue-500',
    analyzing: 'bg-yellow-500',
    waiting_approval: 'bg-orange-500',
    waiting_parts: 'bg-purple-500',
    in_progress: 'bg-cyan-500',
    ready: 'bg-green-500',
    finished: 'bg-green-600',
    canceled: 'bg-red-500',
}

// ==================================================
// Props
// ==================================================
interface OrderTimelineProps {
    orderId: string
    currentStatus: string
}

// ==================================================
// Component
// ==================================================
export default function OrderTimeline({ orderId, currentStatus }: OrderTimelineProps) {
    const [logs, setLogs] = useState<OrderLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchTimeline() {
            setIsLoading(true)
            const result = await getOrderTimeline(orderId)

            if (result.success) {
                setLogs(result.data || [])
            } else {
                setError(result.message || 'Erro ao carregar timeline')
            }

            setIsLoading(false)
        }

        fetchTimeline()
    }, [orderId])

    // Calcular tempo em "Aguardando Peças" (se aplicável)
    const waitingPartsLog = logs.find(l => l.new_status === 'waiting_parts')
    const afterWaitingLog = logs.find(l =>
        l.previous_status === 'waiting_parts' && l.new_status === 'in_progress'
    )

    let waitingPartsDuration: string | null = null
    if (waitingPartsLog && afterWaitingLog) {
        const start = new Date(waitingPartsLog.created_at)
        const end = new Date(afterWaitingLog.created_at)
        const diffMs = end.getTime() - start.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)

        if (diffDays > 0) {
            waitingPartsDuration = `${diffDays} dia(s) e ${diffHours % 24}h`
        } else if (diffHours > 0) {
            waitingPartsDuration = `${diffHours} hora(s)`
        } else {
            waitingPartsDuration = 'menos de 1 hora'
        }
    } else if (waitingPartsLog && currentStatus === 'waiting_parts') {
        // Ainda aguardando
        const start = new Date(waitingPartsLog.created_at)
        const now = new Date()
        const diffMs = now.getTime() - start.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)

        if (diffDays > 0) {
            waitingPartsDuration = `${diffDays} dia(s) e ${diffHours % 24}h (em andamento)`
        } else {
            waitingPartsDuration = `${diffHours} hora(s) (em andamento)`
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Linha do Tempo
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Empty State */}
                {!isLoading && !error && logs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum evento registrado ainda.
                        <br />
                        <span className="text-xs">
                            (Execute a migration order_logs no Supabase)
                        </span>
                    </p>
                )}

                {/* Timeline */}
                {!isLoading && logs.length > 0 && (
                    <div className="relative">
                        {/* Linha vertical */}
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

                        {/* Eventos */}
                        <div className="space-y-4">
                            {logs.map((log, index) => {
                                const Icon = STATUS_ICONS[log.new_status] || Clock
                                const color = STATUS_COLORS[log.new_status] || 'bg-gray-500'
                                const isLast = index === logs.length - 1

                                return (
                                    <div key={log.id} className="relative pl-8">
                                        {/* Dot */}
                                        <div
                                            className={`absolute left-0 top-1 h-4 w-4 rounded-full ${color} flex items-center justify-center`}
                                        >
                                            <Icon className="h-2.5 w-2.5 text-white" />
                                        </div>

                                        {/* Content */}
                                        <div className={isLast ? 'font-medium' : ''}>
                                            <p className="text-sm">
                                                {getStatusLabel(log.new_status)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {log.formatted_date}
                                            </p>

                                            {/* Highlight waiting parts */}
                                            {log.new_status === 'waiting_parts' && waitingPartsDuration && (
                                                <div className="mt-1 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded inline-block">
                                                    ⏱️ Aguardando peça: {waitingPartsDuration}
                                                </div>
                                            )}

                                            {/* Metadata */}
                                            {log.metadata && 'reason' in log.metadata && (
                                                <p className="text-xs text-muted-foreground mt-1 italic">
                                                    &quot;{String(log.metadata.reason)}&quot;
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
