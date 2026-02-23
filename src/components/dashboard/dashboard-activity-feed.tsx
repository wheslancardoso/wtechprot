'use client'

import { useEffect, useState } from 'react'
import { getGlobalActivityFeed, ActivityLog } from '@/app/dashboard/activity-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity, Clock, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Map status to readable text
const STATUS_LABELS: Record<string, string> = {
    open: 'criou a OS',
    analyzing: 'iniciou análise',
    waiting_approval: 'aguardando aprovação',
    waiting_parts: 'aguardando peças',
    in_progress: 'iniciou reparo',
    ready: 'marcou como pronto',
    finished: 'finalizou',
    canceled: 'cancelou',
}

export function DashboardActivityFeed() {
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchActivity = async () => {
            const { data } = await getGlobalActivityFeed(10)
            if (data) setLogs(data)
            setIsLoading(false)
        }
        fetchActivity()
    }, [])

    return (
        <Card className="h-full bg-slate-950/50 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    Atividade Recente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px] pr-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-slate-800" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-slate-800 rounded w-3/4" />
                                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-8">Nenhuma atividade recente.</p>
                    ) : (
                        <div className="space-y-6">
                            {logs.map((log, index) => (
                                <div key={log.id} className="relative pl-4 group">
                                    {/* Timeline line */}
                                    {index !== logs.length - 1 && (
                                        <div className="absolute left-[3px] top-2 bottom-[-24px] w-[2px] bg-slate-800 group-last:hidden" />
                                    )}

                                    {/* Dot */}
                                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary/50 ring-4 ring-slate-950" />

                                    <div className="text-sm">
                                        <div className="flex items-center gap-2 text-slate-200">
                                            <span className="font-medium">
                                                OS #{log.order_display_id}
                                            </span>
                                            <span className="text-muted-foreground text-xs">•</span>
                                            <span className="text-slate-400">
                                                {STATUS_LABELS[log.new_status] || 'atualizou status'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                {log.customer_name}
                                            </span>
                                            <span className="text-muted-foreground text-xs ml-auto">
                                                {log.formatted_date}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/dashboard/orders/${log.order_id}`}
                                            className="absolute inset-0 z-10"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="pt-4 mt-4 border-t border-white/5">
                    <Link href="/dashboard/orders" className="text-xs text-primary hover:underline flex items-center gap-1 justify-center">
                        Ver todas as ordens <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
