import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'
import type { ExecutionTask } from '@/lib/execution-tasks-types'

// Components
// Components
import RealtimeTracker from '@/components/realtime-tracker'

// UI Components
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Icons
import {
    Wrench,
    FileText,
    ArrowLeft,
    Clock,
    CheckCircle2,
    MapPin,
    Smartphone,
    Star,
} from 'lucide-react'

// Status config
const statusLabels: Record<OrderStatus, string> = {
    open: 'Aberta',
    analyzing: 'Em Análise',
    waiting_approval: 'Aguardando Aprovação',
    waiting_parts: 'Aguardando Peças',
    in_progress: 'Em Reparo',
    ready: 'Pronta para Retirada',
    finished: 'Finalizada',
    canceled: 'Cancelada',
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function TrackingPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createAdminClient()

    // Validar se é UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    // Construir query
    let query = supabase
        .from('orders')
        .select(`
      *,
      equipment:equipments(*),
      customer:customers(name)
    `)

    if (isUuid) {
        query = query.eq('id', id)
    } else {
        query = query.eq('display_id', id)
    }

    const { data: order, error } = await query.single()

    if (error || !order) {
        notFound()
    }

    // Buscar configurações da loja
    const { data: settings } = await supabase
        .from('tenants')
        .select('trade_name')
        .eq('id', order.user_id) // tenants.id is the user_id
        .single()

    const equipment = order.equipment

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={`/os/${order.display_id}`}>
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Detalhes
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-sm hidden sm:inline-block">
                            {settings?.trade_name || 'Minha Assistência'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
                {/* Cabeçalho do Equipamento */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-2 border-2 border-background shadow-sm">
                        <Smartphone className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {equipment?.brand} {equipment?.model}
                    </h1>
                    <Badge variant={order.status as OrderStatus} className="text-sm px-3 py-1">
                        {statusLabels[order.status as OrderStatus]}
                    </Badge>
                </div>

                {/* Card Diagnóstico (Resumido) */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Diagnóstico Técnico
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {order.diagnosis_text || 'Diagnóstico em andamento...'}
                        </p>
                    </CardContent>
                </Card>

                {/* Componente Realtime (Checklist) */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight px-1 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Linha do Tempo
                    </h2>

                    {/* Componente Client-Side Realtime */}
                    <RealtimeTracker
                        orderId={order.id}
                        initialTasks={(order.execution_tasks || []) as ExecutionTask[]}
                    />

                    {/* O RealtimeTracker já tem seu próprio listener Supabase Realtime */}
                </div>

                {/* Footer Info */}
                {['ready', 'finished'].includes(order.status) && (
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-700 dark:text-green-300">
                            {order.status === 'finished' ? 'Serviço Finalizado!' : 'Pronto para Retirada!'}
                        </AlertTitle>
                        <AlertDescription className="text-green-600 dark:text-green-400 space-y-3">
                            <p>
                                {order.status === 'finished'
                                    ? 'O serviço foi concluído. Obrigado pela confiança!'
                                    : 'Seu equipamento está pronto. Venha buscar em horário comercial.'}
                            </p>

                            {/* CTA para Avaliação se Finalizado */}
                            {order.status === 'finished' && (
                                <Button
                                    size="sm"
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow-sm"
                                    asChild
                                >
                                    <Link href={`/feedback/${order.id}`}>
                                        <div className="flex items-center justify-center gap-2">
                                            <span>{'⭐'} AVALIAR SERVIÇO AGORA</span>
                                        </div>
                                    </Link>
                                </Button>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="text-center text-xs text-muted-foreground pt-8 space-y-1">
                    <p className="flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {settings?.trade_name || 'Minha Assistência'}
                    </p>
                    <p>Atualizado em tempo real • ID: {order.display_id}</p>
                </div>
            </main>

        </div>
    )
}
