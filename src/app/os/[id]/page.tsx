import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'
import OrderRealtimeListener from '@/components/os/order-realtime-listener'
import type { TechnicalReport } from '@/types/technical-report'
import type { OrderData, StoreSettings } from '@/components/pdf/warranty-pdf'
import TechnicalReportPdfWrapper from '@/components/pdf/technical-report-pdf-wrapper'
import { ImageModal } from '@/components/ui/image-modal'

// Components
import ClientActions from './client-actions'
import ExecutionChecklist from '@/components/os/execution-checklist'
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
    Camera,
    Image as ImageIcon,
    Link2,
    CheckCircle
} from 'lucide-react'
import Image from 'next/image'

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
    waiting_parts: 'Aguardando peças.',
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

    const tradeName = tenant?.trade_name || 'Soluções em Tecnologia'

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
      customer:customers(name, phone),
      custody_photos
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
    const sourcingMode = (order.parts_sourcing_mode || 'assisted') as string

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

    // Verificar se já existe feedback para esta OS
    const { data: existingFeedback } = await supabase
        .from('nps_feedbacks')
        .select('id')
        .eq('order_id', order.id)
        .maybeSingle()

    const hasExistingFeedback = !!existingFeedback

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
        custodyPhotos: order.custody_photos || [],
        finishedAt: order.finished_at || new Date().toISOString(),
        externalParts: externalParts.map((p: any) => ({ name: p.title, price: p.price })),
        partsSourcingMode: sourcingMode,
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
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg">{tenant?.trade_name || 'InforTech'}</span>
                    </Link>
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

                                {/* Banner de Avaliação — renderizado apenas no ClientActions (rodapé fixo) */}
                            </AlertDescription>
                        </Alert>

                        {/* Card: Galeria de Evidências */}
                        {((orderData.custodyPhotos?.length ?? 0) > 0 || (orderData.photosCheckout?.length ?? 0) > 0) && (
                            <Card className="overflow-hidden">
                                <CardHeader className="pb-3 bg-muted/30 border-b border-border/40">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Camera className="h-5 w-5 text-primary" />
                                        Galeria de Evidências
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/40">

                                        {/* Fotos de Check-in */}
                                        {(orderData.custodyPhotos?.length ?? 0) > 0 && (
                                            <div className="p-4 sm:p-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-600 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold">In</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-sm">Entrada do Equipamento</h3>
                                                        <p className="text-xs text-muted-foreground">Fotos tiradas no recebimento</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {orderData.custodyPhotos?.map((photo: { url: string, label?: string }, index: number) => (
                                                        <ImageModal
                                                            key={`in-${index}`}
                                                            src={photo.url}
                                                            alt={`Entrada ${index + 1}`}
                                                            label={photo.label || `Foto ${index + 1}`}
                                                            className="group block relative aspect-square rounded-lg overflow-hidden border bg-muted"
                                                        >
                                                            <Image
                                                                src={photo.url}
                                                                alt={`Entrada ${index + 1}`}
                                                                fill
                                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6">
                                                                <p className="text-[10px] text-white font-medium truncate">
                                                                    {photo.label || `Foto ${index + 1}`}
                                                                </p>
                                                            </div>
                                                        </ImageModal>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Fotos de Check-out */}
                                        {(orderData.photosCheckout?.length ?? 0) > 0 && (
                                            <div className="p-4 sm:p-5 bg-green-50/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold">Out</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-sm">Pronto para Entrega</h3>
                                                        <p className="text-xs text-muted-foreground">Fotos após o reparo / laudo</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {orderData.photosCheckout?.map((photo: any, index: number) => {
                                                        const url = typeof photo === 'string' ? photo : photo.url;
                                                        const label = typeof photo === 'string' ? `Foto ${index + 1}` : (photo.label || `Foto ${index + 1}`);
                                                        return (
                                                            <ImageModal
                                                                key={`out-${index}`}
                                                                src={url}
                                                                alt={`Saída ${index + 1}`}
                                                                label={label}
                                                                className="group block relative aspect-square rounded-lg overflow-hidden border border-green-200 bg-muted"
                                                            >
                                                                <Image
                                                                    src={url}
                                                                    alt={`Saída ${index + 1}`}
                                                                    fill
                                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                                />
                                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6">
                                                                    <p className="text-[10px] text-white font-medium truncate">
                                                                        {label}
                                                                    </p>
                                                                </div>
                                                            </ImageModal>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                        {sourcingMode === 'assisted' && 'Peças Necessárias'}
                                        {sourcingMode === 'resale' && 'Peças Inclusas no Serviço'}
                                        {sourcingMode === 'payment_link' && 'Peças — Link de Pagamento'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Aviso conforme modalidade */}
                                    {sourcingMode === 'assisted' && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                                            <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Compra por sua conta</p>
                                                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                                                    Utilize os links abaixo para adquirir as peças. Após a compra, entre em contato para combinar a entrega.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {sourcingMode === 'resale' && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Peças já inclusas no orçamento</p>
                                                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                                                    Não precisa se preocupar! As peças abaixo já estão no valor total e serão fornecidas pelo técnico.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {sourcingMode === 'payment_link' && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                            <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                <Link2 className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Pagamento das peças</p>
                                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
                                                    Clique nos links abaixo para pagar as peças. Você pode parcelar no cartão de crédito.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lista de Peças */}
                                    <div className="space-y-3">
                                        {externalParts.map((part: { id: string; title: string; external_url: string | null; price: number }) => (
                                            <div
                                                key={part.id}
                                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                            >
                                                <div className="flex-1 pr-2">
                                                    <span className="text-sm font-medium block">{part.title}</span>
                                                    {(sourcingMode === 'resale' || sourcingMode === 'payment_link') && part.price > 0 && (
                                                        <span className="text-xs text-muted-foreground">{formatCurrency(part.price)}</span>
                                                    )}
                                                </div>
                                                {(sourcingMode === 'assisted' || sourcingMode === 'payment_link') && part.external_url && (
                                                    <Button size="sm" variant="default" asChild className="shrink-0">
                                                        <Link href={part.external_url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-1 h-3 w-3" />
                                                            {sourcingMode === 'assisted' ? 'Comprar' : 'Pagar Peça'}
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



                        {/* Rastreamento via banner fixo no ClientActions */}
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

                                {hasParts && sourcingMode === 'assisted' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Peças (você compra)</span>
                                        <span className="text-muted-foreground italic text-xs">Ver links acima</span>
                                    </div>
                                )}

                                {hasParts && sourcingMode === 'resale' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Peças (inclusas)</span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                externalParts.reduce((sum: number, p: { price: number }) => sum + (p.price || 0), 0)
                                            )}
                                        </span>
                                    </div>
                                )}

                                {hasParts && sourcingMode === 'payment_link' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Peças (pagas via link)</span>
                                        <span className="text-muted-foreground font-medium italic">Pagas por você</span>
                                    </div>
                                )}

                                <hr className="my-2" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total a Pagar</span>
                                    <span className="text-primary">
                                        {formatCurrency(
                                            (order.labor_cost || 0)
                                            + (sourcingMode === 'resale' ? externalParts.reduce((sum: number, p: { price: number }) => sum + (p.price || 0), 0) : 0)
                                            - (order.discount_amount || 0)
                                        )}
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    {sourcingMode === 'assisted' && '* Este é o valor da mão de obra, pago diretamente ao técnico.'}
                                    {sourcingMode === 'resale' && '* Valor total inclui mão de obra e peças fornecidas pelo técnico.'}
                                    {sourcingMode === 'payment_link' && '* Este é o valor da mão de obra. As peças são pagas nos links indicados.'}
                                    {hasParts && sourcingMode === 'assisted' && ' As peças são pagas separadamente nos links indicados.'}
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
                hasExistingFeedback={hasExistingFeedback}
                sourcingMode={sourcingMode}
            />
        </div>
    )
}
