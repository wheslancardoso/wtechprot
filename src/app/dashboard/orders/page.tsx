'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatOrderId } from '@/lib/order-utils'
import { createClient } from '@/lib/supabase/client'
import { formatDateToLocal, getDaysAgo, getStartOfMonth } from '@/lib/date-utils'
import type { OrderStatus, Order, Customer, Equipment } from '@/types/database'

// Components
import OrderFilters from './order-filters'

// UI Components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Icons
import {
    ClipboardList,
    Plus,
    Eye,
    Loader2,
    RefreshCw,
    AlertCircle,
} from 'lucide-react'

// Type for order with joined relations
interface OrderWithRelations extends Order {
    customer: Pick<Customer, 'name' | 'document_id'> | null
    equipment: Pick<Equipment, 'type' | 'model' | 'serial_number' | 'brand'> | null
}

// Status label mapping
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

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const searchParams = useSearchParams()
    const supabase = createClient()

    // Buscar ordens com filtros
    const fetchOrders = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            // Pegar parâmetros da URL
            const q = searchParams.get('q') || ''
            const status = searchParams.get('status')
            const period = searchParams.get('period')

            // Query base
            let query = supabase
                .from('orders')
                .select(`
          *,
          customer:customers(name, document_id),
          equipment:equipments(type, model, serial_number, brand)
        `)
                .order('created_at', { ascending: false })

            // Filtro de status
            if (status && status !== 'all') {
                query = query.eq('status', status)
            }

            // Filtro de período
            if (period) {
                switch (period) {
                    case '7d':
                        query = query.gte('created_at', getDaysAgo(7))
                        break
                    case '30d':
                        query = query.gte('created_at', getDaysAgo(30))
                        break
                    case 'month':
                        query = query.gte('created_at', getStartOfMonth())
                        break
                }
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError

            // Filtro textual (client-side por ora - ideal seria fazer no Supabase com Full Text Search)
            let filteredData = (data as OrderWithRelations[]) || []

            if (q) {
                const searchLower = q.toLowerCase()
                filteredData = filteredData.filter((order) => {
                    const displayId = String(order.display_id).toLowerCase()
                    const customerName = order.customer?.name?.toLowerCase() || ''
                    const customerCpf = order.customer?.document_id?.replace(/\D/g, '') || ''
                    const searchClean = q.replace(/\D/g, '')

                    return (
                        displayId.includes(searchLower) ||
                        customerName.includes(searchLower) ||
                        (searchClean && customerCpf.includes(searchClean))
                    )
                })
            }

            setOrders(filteredData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar ordens')
        } finally {
            setLoading(false)
        }
    }, [searchParams, supabase])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Ordens de Serviço
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie todos os atendimentos da sua assistência
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/dashboard/orders/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova OS
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <OrderFilters />

            {/* Loading State */}
            {loading && (
                <div className="flex h-[30vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex h-[30vh] flex-col items-center justify-center gap-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <p className="text-lg font-medium text-destructive">{error}</p>
                    <Button variant="outline" onClick={fetchOrders}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tentar novamente
                    </Button>
                </div>
            )}

            {/* Content */}
            {!loading && !error && (
                <>
                    {orders.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="animate-fade-in">
                            {/* Results count */}
                            <p className="text-sm text-muted-foreground">
                                {orders.length} ordem(ns) encontrada(s)
                            </p>
                            <div className="hidden md:block mt-4">
                                <OrdersTable orders={orders} />
                            </div>
                            <div className="md:hidden mt-4">
                                <MobileOrdersList orders={orders} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

// ==================================================
// Empty State Component
// ==================================================
function EmptyState() {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
                <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                    Nenhuma ordem encontrada
                </h3>
                <p className="text-muted-foreground text-center mb-6">
                    Tente ajustar os filtros ou crie uma nova OS.
                </p>
                <Button asChild>
                    <Link href="/dashboard/orders/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Nova OS
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

// ==================================================
// Orders Table Component
// ==================================================
interface OrdersTableProps {
    orders: OrderWithRelations[]
}

function OrdersTable({ orders }: OrdersTableProps) {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead className="w-[160px]">Status</TableHead>
                        <TableHead className="w-[140px]">Data</TableHead>
                        <TableHead className="w-[80px] text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id} className="table-row-interactive">
                            {/* ID */}
                            <TableCell className="font-mono font-medium">
                                {order.display_id}
                            </TableCell>

                            {/* Cliente */}
                            <TableCell>
                                {order.customer?.name || (
                                    <span className="text-muted-foreground italic">
                                        Não informado
                                    </span>
                                )}
                            </TableCell>

                            {/* Equipamento */}
                            <TableCell>
                                {order.equipment ? (
                                    <span className="text-sm">
                                        {order.equipment.type}
                                        {order.equipment.model && ` - ${order.equipment.model}`}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground italic">—</span>
                                )}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                                <Badge variant={order.status as OrderStatus}>
                                    {statusLabels[order.status as OrderStatus] || order.status}
                                </Badge>
                            </TableCell>

                            {/* Data */}
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDateToLocal(order.created_at, 'dd/MM/yy HH:mm')}
                            </TableCell>

                            {/* Ações */}
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/dashboard/orders/${order.display_id}`}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">Ver detalhes</span>
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

// ==================================================
// Mobile List Component
// ==================================================
function MobileOrdersList({ orders }: OrdersTableProps) {
    return (
        <div className="space-y-4">
            {orders.map((order, index) => (
                <Card key={order.id} className="overflow-hidden card-hover animate-fade-in-up" style={{ '--stagger': `${index * 50}ms` } as React.CSSProperties}>
                    <CardContent className="p-0">
                        <div className="p-4 space-y-3">
                            {/* Header: ID + Status */}
                            <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-lg">
                                    #{order.display_id}
                                </span>
                                <Badge variant={order.status as OrderStatus}>
                                    {statusLabels[order.status as OrderStatus] || order.status}
                                </Badge>
                            </div>

                            {/* Cliente */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Cliente:</span>
                                <span className="font-medium">
                                    {order.customer?.name || <span className="italic text-muted-foreground">Não informado</span>}
                                </span>
                            </div>

                            {/* Equipamento */}
                            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                {order.equipment ? (
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{order.equipment.type}</span>
                                        <span>{order.equipment.brand} {order.equipment.model}</span>
                                    </div>
                                ) : (
                                    <span className="italic">Sem equipamento vinculado</span>
                                )}
                            </div>

                            {/* Footer: Data + Ação */}
                            <div className="flex items-center justify-between pt-3 border-t mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <ClipboardList className="h-3 w-3" />
                                    {formatDateToLocal(order.created_at, 'dd/MM/yy HH:mm')}
                                </span>
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/dashboard/orders/${order.display_id}`}>
                                        Ver Detalhes
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
