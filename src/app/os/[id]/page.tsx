import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'
import OrderRealtimeListener from '@/components/order-realtime-listener'
import type { TechnicalReport } from '@/types/technical-report'
import type { OrderData, StoreSettings } from '@/components/warranty-pdf'
import TechnicalReportPdfWrapper from '@/components/technical-report-pdf-wrapper'

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
    Activity,
    ArrowRight,
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const supabase = await createAdminClient()

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let query = supabase.from('orders').select('display_id, user_id, status').single()

    if (isUuid) {
        query = supabase.from('orders').select('display_id, user_id, status').eq('id', id).single()
    } else {
        query = supabase.from('orders').select('display_id, user_id, status').eq('display_id', id).single()
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

    const tradeName = tenant?.trade_name || 'Assistência Técnica'

    return {
        title: `OS #${order.display_id} | ${tradeName}`,
        description: `Acompanhe o status da sua ordem de serviço #${order.display_id} no ${tradeName}.`,
    }
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
        .select('*')
        .eq('id', order.user_id)
        .single()

    // Fetch Technical Report
    const { data: technicalReport } = await supabase
        .from('technical_reports')
        .select('*')
        .eq('order_id', order.id)
        .maybeSingle()

    // Fetch Equipment details if available
    let equipment = null
    if (order.equipment_id) {
        const { data: eq } = await supabase
            .from('equipments')
            .select('*')
            .eq('id', order.equipment_id)
            .single()
        equipment = eq
    }

    // Prepare data for PDF/Report if exists
    const orderData: OrderData = {
        displayId: String(order.display_id),
        customerName: order.customer?.name || 'Cliente',
        customerPhone: order.customer?.phone || '',
        equipmentType: equipment?.type || 'Equipamento',
        equipmentBrand: equipment?.brand || '',
        equipmentModel: equipment?.model || '',
        diagnosisText: order.diagnosis_text || '',
        laborCost: order.labor_cost || 0,
        photosCheckout: order.photos_checkout || [],
        finishedAt: order.finished_at || new Date().toISOString(),
        externalParts: [],
        signatureEvidence: order.signature_evidence || null,
    }

    // Construct Store Settings
    const storeSettings: StoreSettings = {
        trade_name: tenant?.trade_name || 'Assistência Técnica',
        phone: tenant?.phone,
        // legal_document? map if available
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-32 sm:pb-40">
            {/* Realtime Listener — atualiza a página quando o status da OS muda */}
            <OrderRealtimeListener orderId={order.id} />

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
            <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg md:max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        {/* Status Info */}
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="space-y-3">
                                <div>
                                    <strong>OS #{order.display_id}</strong>
                                    <br />
                                    {statusDescriptions[order.status as OrderStatus]}
                                </div>

                                {/* Banner de Avaliação (Aparece apenas quando Finalizado) */}
                                {(order.status === 'finished' || order.status === 'ready' || order.status === 'delivered') && (
                                    <div className="bg-muted/50 border border-primary/20 p-4 mt-4 rounded-lg">
                                        <div className="flex justify-between items-center flex-wrap gap-2">
                                            <div>
                                                <p className="font-semibold text-foreground">Avalie nosso serviço!</p>
                                                <p className="text-sm text-muted-foreground">Sua opinião é importante e você pode ganhar um cupom.</p>
                                            </div>
                                            <Button size="sm" variant="outline" className="shrink-0 border-primary/20 hover:bg-primary/5" asChild>
                                                <Link href={`/feedback/${order.id}`}>
                                                    Avaliar Agora
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
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

                        {/* Card: Laudo Técnico (Se disponível) */}
                        {technicalReport && (
                            <Card className="border-green-600/20 bg-green-50/10">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileText className="h-5 w-5 text-green-600" />
                                        Laudo Técnico Pericial
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert variant="default" className="bg-white/50">
                                        <AlertDescription className="text-sm">
                                            Um laudo técnico detalhado foi emitido para este serviço.
                                            <br />
                                            <strong>Conclusão:</strong> {technicalReport.conclusion}
                                        </AlertDescription>
                                    </Alert>

                                    <TechnicalReportPdfWrapper
                                        report={technicalReport as TechnicalReport}
                                        orderData={orderData}
                                        storeSettings={storeSettings}
                                        label="Baixar Laudo Técnico Completo (PDF)"
                                        variant="outline"
                                    />
                                </CardContent>
                            </Card>
                        )}



                        {/* Card: Acompanhar Progresso */}
                        {['in_progress', 'waiting_parts'].includes(order.status) && (
                            <Card className="border-primary/20 bg-primary/5">
                                <CardContent className="py-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Activity className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Acompanhe em tempo real</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Veja cada etapa da execução do serviço
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link href={`/os/${order.display_id || order.id}/track`}>
                                                Rastrear
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Card: Resumo Financeiro (Moved to Sidebar) */}
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

                                {/* Discount Section */}
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span className="flex items-center gap-1">
                                            Desconto
                                            {order.coupon_code && <span className="text-xs border border-green-200 bg-green-50 px-1 rounded uppercase">{order.coupon_code}</span>}
                                        </span>
                                        <span className="font-medium">- {formatCurrency(order.discount_amount)}</span>
                                    </div>
                                )}

                                {hasParts && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Peças (você compra)</span>
                                        <span className="text-muted-foreground italic text-xs">Ver links acima</span>
                                    </div>
                                )}

                                <hr className="my-2" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total a Pagar</span>
                                    <span className="text-primary">
                                        {formatCurrency((order.labor_cost || 0) - (order.discount_amount || 0))}
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    * Este é o valor da mão de obra, pago diretamente ao técnico.
                                    {hasParts && ' As peças são pagas separadamente nos links indicados.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
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
