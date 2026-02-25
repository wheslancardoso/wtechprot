import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'
import type { TechnicalReport } from '@/types/technical-report'

export const dynamic = 'force-dynamic'

// Components
import OrderActions from './order-actions'
import EvidenceSection from './evidence-section'
import OrderTimeline from './order-timeline'
import ExecutionChecklist from '@/components/os/execution-checklist'
import TechnicalReportForm from '@/components/os/technical-report-form'
import type { ExecutionTask } from '@/lib/execution-tasks-types'
import type { OrderData, StoreSettings } from '@/components/pdf/warranty-pdf'
import OrderRealtimeListener from '@/components/os/order-realtime-listener'
import WithdrawalTermButton from '@/components/pdf/withdrawal-term-pdf'
import { AIBudgetAssistant } from '@/components/budget/ai-budget-assistant'
import TelemetryTab from './telemetry-tab'
import { ResponsiveOrderTabs } from './responsive-order-tabs'
import { isUuid, parseOrderId } from '@/lib/order-utils'

// UI Components
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from "@/components/ui/tabs"
import { OrderStatusStepper } from '@/components/os/order-status-stepper'

// Icons
import {
    ArrowLeft,
    User,
    Monitor,
    FileText,
    Clock,
    Phone,
    CreditCard,
    Key,
    Hash,
    Package,
    Images,
    Hammer
} from 'lucide-react'

// Status config
const statusLabels: Record<OrderStatus, string> = {
    open: 'Aberta',
    analyzing: 'Em Análise',
    waiting_approval: 'Aguardando Aprovação',
    waiting_parts: 'Aguardando Peças',
    in_progress: 'Em Andamento',
    ready: 'Pronta',
    finished: 'Finalizada',
    canceled: 'Cancelada',
}

// Format date helper
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Format CPF helper
function formatCpf(cpf: string | null): string {
    if (!cpf) return '—'
    const clean = cpf.replace(/\D/g, '')
    if (clean.length !== 11) return cpf
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`
}

// Page Props
interface PageProps {
    params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Obter usuário autenticado primeiro (necessário para RLS em display_id)
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
        .from('orders')
        .select(`
      *,
      customer:customers(*),
      equipment:equipments(*),
      order_items(*)
    `)

    // Buscar por UUID ou display_id (string no banco, ex: '2026WF-0009')
    if (isUuid(id)) {
        query = query.eq('id', id)
    } else {
        query = query.eq('display_id', id)
    }

    const { data: order, error } = await query.single()

    if (error || !order) {
        notFound()
    }

    // Fetch tenant settings for PDF
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user?.id)
        .single()

    // Fetch technical report (usar order.id UUID, não o id da URL)
    const { data: technicalReport } = await supabase
        .from('technical_reports')
        .select('*')
        .eq('order_id', order.id)
        .maybeSingle()

    if (error || !order) {
        notFound()
    }

    const customer = order.customer
    const equipment = order.equipment

    // Preparar dados para PDF de Garantia
    const orderData: OrderData = {
        orderId: order.id,
        displayId: String(order.display_id),
        customerName: customer?.name || 'Cliente',
        customerPhone: customer?.phone || '',
        customerDocument: customer?.document_id || null,
        equipmentType: equipment?.type || 'Equipamento',
        equipmentBrand: equipment?.brand || '',
        equipmentModel: equipment?.model || '',
        equipmentSerial: equipment?.serial_number || null,
        diagnosisText: order.diagnosis_text || '',
        laborCost: order.labor_cost || 0,
        photosCheckin: order.photos_checkin || [],
        photosCheckout: order.photos_checkout || [],
        finishedAt: order.finished_at || new Date().toISOString(),
        externalParts: [],
        signatureEvidence: order.signature_evidence || null,
        custodyEvidence: order.custody_signed_at ? {
            custody_signed_at: order.custody_signed_at,
            custody_ip: order.custody_ip,
            custody_signature_url: order.custody_signature_url,
            custody_integrity_hash: order.custody_integrity_hash,
        } : null,
    }

    // Preparar dados para PDF de Orçamento (se houver orçamento enviado)
    const budgetData = order.diagnosis_text ? {
        displayId: String(order.display_id),
        createdAt: order.updated_at || order.created_at,
        customerName: customer?.name || 'Cliente',
        customerPhone: customer?.phone || '',
        customerDocument: customer?.document_id || null,
        equipmentType: equipment?.type || 'Equipamento',
        equipmentBrand: equipment?.brand || '',
        equipmentModel: equipment?.model || '',
        equipmentSerial: equipment?.serial_number || null,
        diagnosisText: order.diagnosis_text,
        laborCost: order.labor_cost || 0,
        discountAmount: order.discount_amount || 0,
        partsSourcingMode: order.parts_sourcing_mode || 'assisted',
        externalParts: (order.order_items || []).filter((item: { type: string }) => item.type === 'part_external').map((item: { title: string; external_url?: string; price?: number }) => ({
            name: item.title,
            purchaseUrl: item.external_url,
            price: item.price || 0,
        })),
    } : undefined

    // Configurações da Loja
    const snapshot = order.store_snapshot as StoreSettings | null
    const currentSettings = tenant ? {
        trade_name: tenant.trade_name,
        legal_document: tenant.legal_document,
        phone: tenant.phone,
        logo_url: tenant.logo_url,
        warranty_days_labor: tenant.warranty_days || 180,
        address: tenant.address
    } : null

    const storeSettings: StoreSettings = snapshot || (currentSettings ? {
        ...currentSettings,
        warranty_days_labor: currentSettings.warranty_days_labor || 180,
    } : {
        trade_name: 'Minha Assistência',
        warranty_days_labor: 180
    })

    // Sempre usar o valor atual de garantia do tenant (não do snapshot antigo)
    if (tenant?.warranty_days) {
        storeSettings.warranty_days_labor = tenant.warranty_days
    }

    // Helper to get the correct customer report
    const getCustomerReport = () => {
        if (order.problem_description) return order.problem_description
        if (order.diagnosis_text && order.diagnosis_text.startsWith('Relato do cliente:')) {
            const match = order.diagnosis_text.match(/Relato do cliente:\n([\s\S]*?)(\n\n|$)/)
            if (match && match[1]) return match[1].trim()
            return order.diagnosis_text
        }
        return null
    }

    const customerReport = getCustomerReport()

    // Helper to clean technical report
    const getTechnicalReportDisplay = () => {
        if (!order.diagnosis_text) return null
        if (order.diagnosis_text.startsWith('Relato do cliente:')) {
            return order.diagnosis_text.replace(/Relato do cliente:[\s\S]*?(\n\n|$)/, '').trim()
        }
        return order.diagnosis_text
    }

    const technicalDiagnosisDisplay = getTechnicalReportDisplay()

    return (
        <div className="container mx-auto max-w-7xl py-6 px-4 space-y-6">
            {/* Header + Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="w-full md:w-auto">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
                        <Link href="/dashboard/orders" className="underline underline-offset-4 hover:text-foreground flex items-center gap-1">
                            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
                            Ordens
                        </Link>
                        <span>/</span>
                        <span>#{order.display_id}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">OS #{order.display_id}</h1>
                        <Badge variant={order.status} className="text-xs md:text-sm px-3 py-0.5 md:py-1">
                            {statusLabels[order.status as OrderStatus]}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs md:text-sm flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                        Aberta em {formatDate(order.created_at)}
                    </p>
                </div>

                <div className="w-full space-y-6">
                    {/* Stepper Visual */}
                    <div className="bg-slate-950/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
                        <OrderStatusStepper currentStatus={order.status} />
                    </div>

                    <OrderActions
                        orderId={order.id}
                        currentStatus={order.status}
                        orderData={orderData}
                        budgetData={budgetData}
                        storeSettings={storeSettings}
                        customerName={orderData.customerName}
                        displayId={order.display_id}
                        technicalReport={technicalReport}
                        problemDescription={customerReport || undefined}
                        discountAmount={order.discount_amount || 0}
                        sourcingMode={order.parts_sourcing_mode || 'assisted'}
                    />

                    {order.custody_signature_url && (
                        <WithdrawalTermButton
                            data={{
                                orderDisplayId: order.display_id,
                                customerName: order.customer?.name || 'Cliente',
                                customerDocument: order.customer?.document_id || '',
                                equipmentType: order.equipment?.type || 'Equipamento',
                                equipmentBrand: order.equipment?.brand || '',
                                equipmentModel: order.equipment?.model || '',
                                equipmentSerial: order.equipment?.serial_number || '',
                                accessories: order.accessories_received || [],
                                conditionNotes: order.custody_conditions || '',
                                signatureUrl: order.custody_signature_url,
                                signedAt: order.custody_signed_at || new Date().toISOString()
                            }}
                            settings={storeSettings}
                        />
                    )}
                </div>
            </div>

            {/* TABBED LAYOUT */}
            <ResponsiveOrderTabs defaultValue="overview">
                {/* 1. Visão Geral */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Summary Card: Customer */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" /> Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {customer ? (
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold leading-none">{customer.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatCpf(customer.document_id)}</p>
                                        <div className="flex items-center gap-2 pt-2">
                                            <Phone className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">{customer.phone || '—'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm italic text-muted-foreground">Não vinculado</span>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary Card: Equipment */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <Monitor className="h-4 w-4" /> Equipamento
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {equipment ? (
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold leading-none">{equipment.brand} {equipment.model}</p>
                                        <p className="text-sm text-muted-foreground capitalize">{equipment.type}</p>
                                        <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                                            <Hash className="h-4 w-4" />
                                            <span className="text-sm font-mono">{equipment.serial_number || 'S/N'}</span>
                                        </div>
                                        {/* Security Info (Passwords) */}
                                        {(equipment.remote_access_id || equipment.notes?.includes('Senha:')) && (
                                            <div className="mt-3 pt-3 border-t text-xs space-y-1">
                                                {equipment.remote_access_id && (
                                                    <div className="grid grid-cols-[60px_1fr]">
                                                        <span className="text-muted-foreground">AnyDesk:</span>
                                                        <span className="font-mono select-all">{equipment.remote_access_id}</span>
                                                    </div>
                                                )}
                                                {equipment.notes?.includes('Senha:') && (
                                                    <div className="grid grid-cols-[60px_1fr]">
                                                        <span className="text-muted-foreground">Senha:</span>
                                                        <span className="font-mono select-all font-bold text-red-500">
                                                            {equipment.notes.replace('Senha: ', '')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-sm italic text-muted-foreground">—</span>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary Card: Recent Status */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" /> Situação Atual
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <Badge variant={order.status}>{statusLabels[order.status as OrderStatus]}</Badge>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Última atualização</span>
                                        <span className="text-sm font-medium">{formatDate(order.updated_at || order.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customer Report (Full Width) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Relato do Problema
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/50 p-4 rounded-lg border">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {customerReport || 'Nenhum relato registrado.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. Técnico */}
                <TabsContent value="technical" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left: AI Budget Assistant & Current Diagnosis */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Monitor className="h-5 w-5" />
                                        Diagnóstico & Orçamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* AI Assistant - Only visible if analyzing or later */}
                                    {order.status !== 'open' && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Assistente de Orçamento</h4>
                                            <AIBudgetAssistant />
                                        </div>
                                    )}

                                    {/* Current Diagnosis Display */}
                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Laudo Técnico Atual</h4>
                                        <div className="bg-muted/30 border rounded-lg p-4 min-h-[100px]">
                                            <p className="whitespace-pre-wrap text-sm">
                                                {technicalDiagnosisDisplay || <span className="text-muted-foreground italic">Aguardando análise técnica...</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {order.solution_text && (
                                        <div className="pt-4 border-t">
                                            <h4 className="text-sm font-medium mb-3 text-green-600">Solução Aplicada</h4>
                                            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                <p className="whitespace-pre-wrap text-sm">{order.solution_text}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right: Technical Report Form (Editing) */}
                        <div className="space-y-6">
                            {order.status !== 'open' ? (
                                <TechnicalReportForm
                                    orderId={order.id}
                                    tenantId={tenant?.id || ''}
                                    existingReport={technicalReport as TechnicalReport | null}
                                    orderData={orderData}
                                    storeSettings={storeSettings}
                                    checkinPhotos={order.photos_checkin || []}
                                    checkoutPhotos={order.photos_checkout || []}
                                />
                            ) : (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <Hammer className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                        <h3 className="text-lg font-medium">Ordem em Aberto</h3>
                                        <p className="text-muted-foreground max-w-sm mt-2">
                                            Inicie a análise da ordem para liberar o preenchimento do Laudo Técnico.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* 3. Execução */}
                <TabsContent value="execution" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <ExecutionChecklist
                                orderId={order.id}
                                initialTasks={(order.execution_tasks || []) as ExecutionTask[]}
                                isEditable={!['ready', 'finished', 'canceled'].includes(order.status)}
                            />
                        </div>
                        <div>
                            <OrderTimeline orderId={order.id} currentStatus={order.status} />
                        </div>
                    </div>
                </TabsContent>

                {/* 4. Anexos/Evidence */}
                <TabsContent value="evidence">
                    <EvidenceSection
                        orderId={order.id}
                        status={order.status}
                        customerName={customer?.name || 'Cliente'}
                        customerPhone={customer?.phone || ''}
                        displayId={order.display_id}
                        laborCost={order.labor_cost}
                        photosCheckin={order.photos_checkin || []}
                        photosCheckout={order.photos_checkout || []}
                    />
                </TabsContent>

                {/* 5. Telemetria (Novo) */}
                <TabsContent value="telemetry">
                    <TelemetryTab
                        orderId={order.id}
                        equipmentId={order.equipment_id}
                        tenantId={order.tenant_id}
                    />
                </TabsContent>
            </ResponsiveOrderTabs>

            {/* Listener de Realtime (Invisible) */}
            <OrderRealtimeListener orderId={order.id} />
        </div>
    )
}
