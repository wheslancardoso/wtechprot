import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'

// Components
import ClientActions from './client-actions'
import ExecutionChecklist from '@/components/execution-checklist'
import type { ExecutionTask } from '@/lib/execution-tasks-types'

// UI Components
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Icons
import {
    Wrench,
    FileText,
    ShoppingCart,
    Receipt,
    ExternalLink,
    AlertTriangle,
} from 'lucide-react'

// Status config
const statusLabels: Record<OrderStatus, string> = {
    open: 'Aberta',
    analyzing: 'Em Análise',
    waiting_approval: 'Aguardando Sua Aprovação',
    waiting_parts: 'Aguardando Peças',
    in_progress: 'Em Reparo',
    ready: 'Pronta para Retirada',
    finished: 'Finalizada',
    canceled: 'Cancelada',
}

const statusDescriptions: Record<OrderStatus, string> = {
    open: 'Seu equipamento está na fila para análise.',
    analyzing: 'O técnico está avaliando o problema.',
    waiting_approval: 'Revise o orçamento abaixo e aprove para iniciarmos o reparo.',
    waiting_parts: 'Aguardando você comprar e entregar as peças.',
    in_progress: 'Seu equipamento está sendo reparado.',
    ready: 'Seu equipamento está pronto! Entre em contato para retirada.',
    finished: 'Serviço concluído. Obrigado pela confiança!',
    canceled: 'Este serviço foi cancelado.',
}

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

// Page Props
interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ClientOrderPage({ params }: PageProps) {
    const { id } = await params

    // Usar cliente admin para bypass de RLS (rota pública)
    const supabase = await createAdminClient()

    // Validar se é UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    // Construir query inicial
    let query = supabase
        .from('orders')
        .select(`
      *,
      order_items(*),
      customer:customers(name, phone)
    `)

    // Aplicar filtro adequado
    if (isUuid) {
        query = query.eq('id', id)
    } else {
        query = query.eq('display_id', id)
    }

    // Executar query
    const { data: order, error } = await query.single()

    if (error || !order) {
        notFound()
    }

    // Filtrar apenas peças externas
    const externalParts = order.order_items?.filter(
        (item: { type: string }) => item.type === 'part_external'
    ) || []

    const hasParts = externalParts.length > 0

    // Buscar telefone do técnico (Tenant)
    const { data: tenant } = await supabase
        .from('tenants')
        .select('phone, trade_name')
        .eq('id', order.user_id)
        .single()

    return (
        <div className="min-h-screen bg-muted/30 pb-32 sm:pb-40">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg">{tenant?.trade_name || 'InforTech'}</span>
                    </div>
                    <Badge variant={order.status as OrderStatus} className="text-sm">
                        {statusLabels[order.status as OrderStatus] || order.status}
                    </Badge>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
                {/* Status Info */}
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>OS #{order.display_id}</strong>
                        <br />
                        {statusDescriptions[order.status as OrderStatus]}

                        {/* Botão de Rastreamento (Pós Aprovação) */}

                    </AlertDescription>
                </Alert>

                {/* Card: Diagnóstico */}
                {order.diagnosis_text && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-5 w-5 text-primary" />
                                Diagnóstico Técnico
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                {order.diagnosis_text}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Card: Peças Necessárias */}
                {hasParts && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                Peças Necessárias
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Aviso Compra Assistida */}
                            <Alert variant="warning" className="py-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    <strong>Atenção:</strong> A compra das peças é responsabilidade do cliente.
                                    Após comprar, entre em contato para combinar a entrega.
                                </AlertDescription>
                            </Alert>

                            {/* Lista de Peças */}
                            <div className="space-y-3">
                                {externalParts.map((part: { id: string; title: string; external_url: string | null }) => (
                                    <div
                                        key={part.id}
                                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                    >
                                        <span className="text-sm font-medium flex-1 pr-2">{part.title}</span>
                                        {part.external_url && (
                                            <Button size="sm" variant="default" asChild className="shrink-0">
                                                <Link href={part.external_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    Comprar
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Card: Resumo Financeiro */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Receipt className="h-5 w-5 text-primary" />
                            Resumo Financeiro
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Mão de Obra</span>
                            <span className="font-medium">{formatCurrency(order.labor_cost || 0)}</span>
                        </div>

                        {hasParts && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Peças (você compra)</span>
                                <span className="text-muted-foreground italic text-xs">Ver links acima</span>
                            </div>
                        )}

                        <hr className="my-2" />

                        <div className="flex justify-between text-lg font-bold">
                            <span>Total a Pagar</span>
                            <span className="text-primary">{formatCurrency(order.labor_cost || 0)}</span>
                        </div>

                        <p className="text-xs text-muted-foreground text-center pt-2">
                            * Este é o valor da mão de obra, pago diretamente ao técnico.
                            {hasParts && ' As peças são pagas separadamente nos links indicados.'}
                        </p>
                    </CardContent>
                </Card>

                {/* Card: Progresso movido para /track */}
            </main>

            {/* Footer com Ações do Cliente */}
            <ClientActions
                orderId={order.id}
                displayId={order.display_id}
                hasParts={hasParts}
                status={order.status}
                customerName={order.customer?.name || 'Cliente'}
                techPhone={tenant?.phone}
            />
        </div>
    )
}
