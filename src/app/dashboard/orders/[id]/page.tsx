import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'

// Components
import OrderActions from './order-actions'
import EvidenceSection from './evidence-section'
import OrderTimeline from './order-timeline'
import ExecutionChecklist from '@/components/execution-checklist'
import type { ExecutionTask } from '@/lib/execution-tasks-types'
import type { OrderData, StoreSettings } from '@/components/warranty-pdf'
import OrderRealtimeListener from '@/components/order-realtime-listener'
import WithdrawalTermButton from '@/components/home-care/withdrawal-term-pdf'

// UI Components
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

    // Fetch order with relations
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      customer:customers(*),
      equipment:equipments(*)
    `)
        .eq('id', id)
        .single()

    // Fetch tenant settings for PDF
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single()

    if (error || !order) {
        notFound()
    }

    const customer = order.customer
    const equipment = order.equipment

    // Preparar dados para PDF de Garantia (Com dados reais do Tenant)
    const orderData: OrderData = {
        displayId: String(order.display_id),
        customerName: customer?.name || 'Cliente',
        customerPhone: customer?.phone || '',
        equipmentType: equipment?.type || 'Equipamento',
        equipmentBrand: equipment?.brand || '',
        equipmentModel: equipment?.model || '',
        diagnosisText: order.diagnosis_text || '',
        laborCost: order.labor_cost || 0,
        photosCheckout: order.photos_checkout || [],
        finishedAt: order.finished_at || new Date().toISOString(),
        externalParts: [], // TODO: Buscar external parts se houver tabela
        signatureEvidence: order.signature_evidence || null,
    }

    // Configurações da Loja (Do Banco de Dados)
    // Configurações da Loja (Snapshot ou Atual no Banco)
    const snapshot = order.store_snapshot as StoreSettings | null
    const currentSettings = tenant ? {
        trade_name: tenant.trade_name,
        legal_document: tenant.legal_document,
        phone: tenant.phone,
        logo_url: tenant.logo_url,
        warranty_days_labor: tenant.warranty_days || 90,
        address: tenant.address
    } : null

    // Priorizar Snapshot -> Settings Atuais -> Default
    const storeSettings: StoreSettings = snapshot || (currentSettings ? {
        ...currentSettings,
        warranty_days_labor: currentSettings.warranty_days_labor || 90,
    } : {
        trade_name: 'Minha Assistência',
        warranty_days_labor: 90
    })

    return (
        <div className="container mx-auto max-w-7xl py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                {/* Back link */}
                <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para lista
                </Link>

                {/* Title row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* OS ID */}
                        <h1 className="text-3xl font-bold tracking-tight">
                            OS #{String(order.display_id).padStart(4, '0')}
                        </h1>

                        {/* Status Badge (Grande) */}
                        <Badge variant={order.status as OrderStatus} className="text-sm px-3 py-1">
                            {statusLabels[order.status as OrderStatus] || order.status}
                        </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <OrderActions
                            orderId={order.id}
                            currentStatus={order.status}
                            orderData={orderData}
                            storeSettings={storeSettings}
                            customerName={customer?.name || 'Cliente'}
                            displayId={order.display_id}
                        />

                        {/* Botão de Termo de Retirada (Só se tiver assiante) */}
                        {order.custody_signature_url && (
                            <WithdrawalTermButton
                                data={{
                                    orderDisplayId: order.display_id,
                                    customerName: customer?.name || 'Consumidor',
                                    customerDocument: customer?.document_id || '',
                                    equipmentType: equipment?.type || 'Equipamento',
                                    equipmentBrand: equipment?.brand || '',
                                    equipmentModel: equipment?.model || '',
                                    equipmentSerial: equipment?.serial_number || '',
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

                {/* Meta info */}
                <p className="text-muted-foreground mt-2">
                    Aberta em {formatDate(order.created_at)}
                </p>
            </div>

            {/* Grid Principal */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna Esquerda (1/3) */}
                <div className="space-y-6">
                    {/* Card Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {customer ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nome</p>
                                        <p className="font-medium">{customer.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">CPF</p>
                                            <p className="font-mono">{formatCpf(customer.document_id)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">WhatsApp</p>
                                            <p>{customer.phone || '—'}</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground italic">Cliente não vinculado</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card Equipamento */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Monitor className="h-5 w-5" />
                                Equipamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {equipment ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tipo</p>
                                        <p className="font-medium capitalize">{equipment.type || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Marca / Modelo</p>
                                        <p className="font-medium">
                                            {equipment.brand || ''} {equipment.model || '—'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Número de Série</p>
                                            <p className="font-mono text-sm">{equipment.serial_number || '—'}</p>
                                        </div>
                                    </div>

                                    {/* Acesso Remoto (Visível Apenas para Técnicos) */}
                                    {(equipment.remote_access_id || equipment.remote_access_password) && (
                                        <div className="border-t border-border pt-2 mt-2 space-y-2">
                                            <div className="flex items-center gap-2 text-primary font-medium">
                                                <Monitor className="h-4 w-4" />
                                                <span className="text-sm">Acesso Remoto</span>
                                            </div>
                                            {equipment.remote_access_id && (
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <span className="text-muted-foreground">ID:</span>
                                                    <span className="font-mono col-span-2 select-all">{equipment.remote_access_id}</span>
                                                </div>
                                            )}
                                            {equipment.remote_access_password && (
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <span className="text-muted-foreground">Senha:</span>
                                                    <span className="font-mono col-span-2 select-all text-red-400">{equipment.remote_access_password}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {equipment.notes && equipment.notes.includes('Senha:') && (
                                        <div className="flex items-center gap-2">
                                            <Key className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Senha de Acesso (Device)</p>
                                                <p className="font-mono text-sm">
                                                    {equipment.notes.replace('Senha: ', '')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground italic">Equipamento não vinculado</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Centro/Direita (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Card Diagnóstico Técnico */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5" />
                                Diagnóstico Técnico
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Relato do Cliente</h4>
                                    <div className="bg-muted rounded-lg p-4">
                                        <p className="whitespace-pre-wrap text-sm">
                                            {order.diagnosis_text || 'Nenhum relato registrado.'}
                                        </p>
                                    </div>
                                </div>

                                {order.solution_text && (
                                    <div>
                                        <h4 className="font-medium mb-2">Solução Aplicada</h4>
                                        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                            <p className="whitespace-pre-wrap text-sm">
                                                {order.solution_text}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card Timeline - Novo componente dinâmico */}
                    <OrderTimeline orderId={order.id} currentStatus={order.status} />

                    {/* Checklist de Execução - visível quando em andamento */}
                    {['in_progress', 'waiting_parts', 'analyzing'].includes(order.status) && (
                        <ExecutionChecklist
                            orderId={order.id}
                            initialTasks={(order.execution_tasks || []) as ExecutionTask[]}
                            isEditable={true}
                        />
                    )}
                </div>
            </div>

            {/* Seção de Evidências e Comunicação */}
            <div className="mt-6">
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
            </div>

            {/* Listener de Realtime */}
            <OrderRealtimeListener orderId={order.id} />
        </div>
    )
}
