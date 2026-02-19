'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCustomersWithStats, type CustomerWithStats } from './actions'
import { EditCustomerDialog } from './edit-customer-dialog'
import { formatDateToLocal, formatRelativeDate } from '@/lib/date-utils'

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
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

// Icons
import {
    Users,
    Search,
    Eye,
    Loader2,
    AlertCircle,
    RefreshCw,
    DollarSign,
    ClipboardList,
} from 'lucide-react'

// Format currency
function formatCurrency(value: number): string {
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

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const router = useRouter()
    const searchParams = useSearchParams()

    const fetchCustomers = useCallback(async (searchTerm?: string) => {
        setLoading(true)
        setError(null)

        const result = await getCustomersWithStats(searchTerm)

        if (result.success) {
            setCustomers(result.data || [])
        } else {
            setError(result.message || 'Erro ao carregar clientes')
        }

        setLoading(false)
    }, [])

    useEffect(() => {
        const q = searchParams.get('q') || ''
        setSearch(q)
        fetchCustomers(q)
    }, [searchParams, fetchCustomers])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/dashboard/customers?q=${encodeURIComponent(search)}`)
    }

    // Total LTV de todos os clientes
    const totalLtv = customers.reduce((sum, c) => sum + c.total_ltv, 0)
    const totalOrders = customers.reduce((sum, c) => sum + c.orders_count, 0)

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Clientes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie sua base de clientes e histórico
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <Users className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                                <p className="text-2xl font-bold">{customers.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <ClipboardList className="h-8 w-8 text-purple-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">OS Finalizadas</p>
                                <p className="text-2xl font-bold">{totalOrders}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <DollarSign className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">LTV Total (Mão de Obra)</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalLtv)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar por nome ou CPF..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button type="submit">
                    <Search className="h-4 w-4" />
                </Button>
            </form>

            {/* Loading */}
            {loading && (
                <div className="flex h-[30vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <p className="text-lg font-medium text-destructive">{error}</p>
                    <Button variant="outline" onClick={() => fetchCustomers()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tentar novamente
                    </Button>
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <>
                    {customers.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    Nenhum cliente encontrado
                                </h3>
                                <p className="text-muted-foreground text-center">
                                    Os clientes são criados automaticamente ao abrir uma OS.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="rounded-md border bg-card hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>CPF</TableHead>
                                            <TableHead>WhatsApp</TableHead>
                                            <TableHead className="text-center">OS</TableHead>
                                            <TableHead className="text-right">LTV</TableHead>
                                            <TableHead>Última Visita</TableHead>
                                            <TableHead className="w-[80px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customers.map((customer) => (
                                            <TableRow key={customer.id} className="table-row-interactive">
                                                <TableCell className="font-medium">
                                                    {customer.name}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {formatCpf(customer.document_id)}
                                                </TableCell>
                                                <TableCell>
                                                    {customer.phone || '—'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium">
                                                        {customer.orders_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-green-600">
                                                    {formatCurrency(customer.total_ltv)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {customer.last_order_date
                                                        ? formatRelativeDate(customer.last_order_date)
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <EditCustomerDialog
                                                            customer={customer}
                                                            onUpdate={() => fetchCustomers(search)}
                                                        />
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/dashboard/customers/${customer.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="md:hidden">
                                <MobileCustomersList customers={customers} onUpdate={() => fetchCustomers(search)} />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

// ==================================================
// Mobile List Component
// ==================================================
function MobileCustomersList({ customers, onUpdate }: { customers: CustomerWithStats[], onUpdate: () => void }) {
    return (
        <div className="space-y-4">
            {customers.map((customer) => (
                <Card key={customer.id} className="overflow-hidden card-hover">
                    <CardContent className="p-0">
                        <div className="p-4 space-y-3">
                            {/* Header: Name + Badge */}
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-lg truncate">
                                    {customer.name}
                                </span>
                                <span className="inline-flex items-center justify-center min-w-[2rem] h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium px-2 text-xs">
                                    {customer.orders_count} OS
                                </span>
                            </div>

                            {/* Info */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">CPF</p>
                                    <p className="font-mono">{formatCpf(customer.document_id)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                                    <p>{customer.phone || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">LTV</p>
                                    <p className="font-medium text-green-600">{formatCurrency(customer.total_ltv)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Última Visita</p>
                                    <p>{customer.last_order_date ? formatRelativeDate(customer.last_order_date) : '—'}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                                <EditCustomerDialog
                                    customer={customer}
                                    onUpdate={onUpdate}
                                />
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/dashboard/customers/${customer.id}`}>
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
