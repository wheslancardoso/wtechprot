'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { OrderStatus, Order, Customer, Equipment } from '@/types/database'

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
    customer: Pick<Customer, 'name'> | null
    equipment: Pick<Equipment, 'type' | 'model' | 'serial_number'> | null
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

    const supabase = createClient()

    async function fetchOrders() {
        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select(`
          *,
          customer:customers(name),
          equipment:equipments(type, model, serial_number)
        `)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            setOrders((data as OrderWithRelations[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar ordens')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Loading State
    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Error State
    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-lg font-medium text-destructive">{error}</p>
                <Button variant="outline" onClick={fetchOrders}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar novamente
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Ordens de Serviço
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie todos os atendimentos da sua assistência
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/orders/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova OS
                    </Link>
                </Button>
            </div>

            {/* Content - Conditional rendering based on data */}
            {orders.length === 0 ? (
                <EmptyState />
            ) : (
                <OrdersTable orders={orders} />
            )}
        </div>
    )
}

// ==================================================
// Empty State Component
// ==================================================
function EmptyState() {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                {/* Icon */}
                <div className="mb-6 rounded-full bg-muted p-6">
                    <ClipboardList className="h-12 w-12 text-muted-foreground" />
                </div>

                {/* Text */}
                <h3 className="mb-2 text-xl font-semibold">
                    Nenhuma ordem de serviço encontrada
                </h3>
                <p className="mb-6 max-w-sm text-muted-foreground">
                    Você ainda não registrou atendimentos. Comece criando uma nova OS.
                </p>

                {/* CTA Button */}
                <Button asChild size="lg">
                    <Link href="/dashboard/orders/new">
                        <Plus className="mr-2 h-5 w-5" />
                        Nova Ordem de Serviço
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

// ==================================================
// Orders Table Component
// ==================================================
function OrdersTable({ orders }: { orders: OrderWithRelations[] }) {
    return (
        <div className="rounded-lg border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            {/* ID */}
                            <TableCell className="font-mono font-medium">
                                #{String(order.display_id).padStart(4, '0')}
                            </TableCell>

                            {/* Cliente */}
                            <TableCell>
                                {order.customer?.name || (
                                    <span className="text-muted-foreground italic">
                                        Sem cliente
                                    </span>
                                )}
                            </TableCell>

                            {/* Equipamento */}
                            <TableCell>
                                {order.equipment ? (
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {order.equipment.type} {order.equipment.model}
                                        </span>
                                        {order.equipment.serial_number && (
                                            <span className="text-xs text-muted-foreground">
                                                S/N: {order.equipment.serial_number}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic">
                                        Sem equipamento
                                    </span>
                                )}
                            </TableCell>

                            {/* Status Badge */}
                            <TableCell>
                                <Badge variant={order.status as OrderStatus}>
                                    {statusLabels[order.status] || order.status}
                                </Badge>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/dashboard/orders/${order.id}`}>
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
