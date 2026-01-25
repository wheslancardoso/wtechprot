import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'

// Components
import OrderActions from './order-actions'

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
    Play,
    Phone,
    CreditCard,
    Key,
    Hash,
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

    if (error || !order) {
        notFound()
    }

    const customer = order.customer
    const equipment = order.equipment

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
                    <OrderActions orderId={order.id} currentStatus={order.status} />
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
                                    {equipment.notes && equipment.notes.includes('Senha:') && (
                                        <div className="flex items-center gap-2">
                                            <Key className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Senha de Acesso</p>
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

                    {/* Card Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                {/* Linha vertical */}
                                <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

                                {/* Eventos */}
                                <div className="space-y-4">
                                    {/* Evento: Abertura */}
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary" />
                                        <div>
                                            <p className="font-medium">OS Aberta</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Evento: Atualização (se houver) */}
                                    {order.updated_at !== order.created_at && (
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-muted border-2 border-primary" />
                                            <div>
                                                <p className="font-medium">Última Atualização</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(order.updated_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Evento: Finalização (se houver) */}
                                    {order.finished_at && (
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-green-500" />
                                            <div>
                                                <p className="font-medium text-green-600">OS Finalizada</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(order.finished_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
