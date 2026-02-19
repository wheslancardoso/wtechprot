import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCustomerDetail } from '../actions'
import { formatDateToLocal } from '@/lib/date-utils'

// UI Components
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponsiveTabs } from '@/components/ui/responsive-tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

// Icons
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    ClipboardList,
    Smartphone,
    DollarSign,
    Eye,
    CreditCard,
} from 'lucide-react'

// Status labels
const statusLabels: Record<string, string> = {
    open: 'Aberta',
    analyzing: 'Em Análise',
    waiting_approval: 'Aguardando Aprovação',
    waiting_parts: 'Aguardando Peças',
    in_progress: 'Em Andamento',
    ready: 'Pronta',
    finished: 'Finalizada',
    canceled: 'Cancelada',
}

// Format currency local
function formatMoney(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

// Format CPF
function formatCpf(cpf: string | null): string {
    if (!cpf) return '—'
    const clean = cpf.replace(/\D/g, '')
    if (clean.length !== 11) return cpf
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
    const { id } = await params
    const result = await getCustomerDetail(id)

    if (!result.success || !result.data) {
        notFound()
    }

    const customer = result.data

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">


            {/* Header */}
            <div>
                <Link
                    href="/dashboard/customers"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para lista
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {customer.name}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Cliente desde {formatDateToLocal(customer.created_at, 'MMMM yyyy')}
                        </p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-sm text-muted-foreground">Lifetime Value</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatMoney(customer.total_ltv)}
                        </p>
                    </div>
                </div>
            </div>

            {/* ... Stats ... */}

            {/* Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <Card>
                    {/* ... (unchanged) ... */}
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Dados Cadastrais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">CPF</p>
                                <p className="font-mono">{formatCpf(customer.document_id)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">WhatsApp</p>
                                <p>{customer.phone || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">E-mail</p>
                                <p>{customer.email || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Endereço</p>
                                <p>{customer.address || '—'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="lg:col-span-2">
                    <ResponsiveTabs
                        defaultValue="orders"
                        items={[
                            { value: 'orders', label: `Histórico de OS (${customer.orders.length})` },
                            { value: 'equipments', label: `Equipamentos (${customer.equipments.length})` }
                        ]}
                    >
                        {/* Orders Tab */}
                        <TabsContent value="orders" className="mt-4">
                            {customer.orders.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        Nenhuma OS registrada para este cliente.
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {/* Mobile List (Cards) */}
                                    <div className="grid gap-4 md:hidden">
                                        {customer.orders.map((order) => {
                                            const eq = order.equipment
                                            return (
                                                <Card key={order.id} className="overflow-hidden">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <span className="font-mono font-bold text-lg">#{String(order.display_id).padStart(4, '0')}</span>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {formatDateToLocal(order.created_at, 'dd/MM/yy')}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <Badge variant={order.status as 'open' | 'finished'}>
                                                                    {statusLabels[order.status] || order.status}
                                                                </Badge>
                                                                <p className="font-bold text-green-600 mt-1">
                                                                    {order.labor_cost ? formatMoney(order.labor_cost) : '—'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="bg-muted/30 p-2 rounded text-sm mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium">
                                                                    {eq ? `${eq.type} ${eq.model || ''}` : 'Equipamento não informado'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <Button variant="outline" className="w-full" asChild>
                                                            <Link href={`/dashboard/orders/${order.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                                            </Link>
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })}
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden md:block rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>OS</TableHead>
                                                    <TableHead>Equipamento</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Data</TableHead>
                                                    <TableHead className="text-right">Valor</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customer.orders.map((order) => {
                                                    const eq = order.equipment
                                                    return (
                                                        <TableRow key={order.id}>
                                                            <TableCell className="font-mono font-medium">
                                                                #{String(order.display_id).padStart(4, '0')}
                                                            </TableCell>
                                                            <TableCell>
                                                                {eq ? `${eq.type} ${eq.model || ''}` : '—'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={order.status as 'open' | 'finished'}>
                                                                    {statusLabels[order.status] || order.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {formatDateToLocal(order.created_at, 'dd/MM/yy')}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {order.labor_cost ? formatMoney(order.labor_cost) : '—'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <Link href={`/dashboard/orders/${order.id}`}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        {/* Equipments Tab */}
                        <TabsContent value="equipments" className="mt-4">
                            {customer.equipments.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        Nenhum equipamento registrado.
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {/* Mobile List (Cards) */}
                                    <div className="grid gap-4 md:hidden">
                                        {customer.equipments.map((eq) => (
                                            <Card key={eq.id}>
                                                <CardContent className="p-4 flex items-center gap-4">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                                        <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-lg">{eq.brand} {eq.model}</p>
                                                        <p className="text-sm text-muted-foreground capitalize mb-1">{eq.type}</p>
                                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                                                                S/N: {eq.serial_number || '—'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <ClipboardList className="h-3 w-3" />
                                                                {eq.orders_count} visitas
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden md:block rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tipo</TableHead>
                                                    <TableHead>Marca/Modelo</TableHead>
                                                    <TableHead>Serial/IMEI</TableHead>
                                                    <TableHead className="text-center">Visitas</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customer.equipments.map((eq) => (
                                                    <TableRow key={eq.id}>
                                                        <TableCell className="capitalize font-medium">
                                                            {eq.type}
                                                        </TableCell>
                                                        <TableCell>
                                                            {eq.brand} {eq.model}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm">
                                                            {eq.serial_number || '—'}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-medium">
                                                                {eq.orders_count}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </TabsContent>
                    </ResponsiveTabs>
                </div>
            </div>
        </div>
    )
}
