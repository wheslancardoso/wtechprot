import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from './settings/actions'
import { formatDateToLocal, formatRelativeDate } from '@/lib/date-utils'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { DashboardActivityFeed } from '@/components/dashboard/dashboard-activity-feed'

// Icons
import {
    Plus,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Clock,
    Package,
    ClipboardList,
    ArrowRight,
    CheckCircle,
    Users,
} from 'lucide-react'

// ==================================================
// Formatar moeda
// ==================================================
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

// ==================================================
// Page Component
// ==================================================
export default async function DashboardHomePage() {
    const supabase = await createClient()
    const settingsResult = await getSettings()
    const settings = settingsResult.data

    // Buscar métricas
    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01`

    // Faturamento anual (apenas labor_cost - MEI Safe)
    const { data: yearlyOrders } = await supabase
        .from('orders')
        .select('labor_cost')
        .eq('status', 'finished')
        .gte('finished_at', startOfYear)

    const yearlyRevenue = yearlyOrders?.reduce((sum, o) => sum + (o.labor_cost || 0), 0) || 0
    const meiLimit = settings?.mei_limit_annual || 81000
    const meiProgress = (yearlyRevenue / meiLimit) * 100

    // OS aguardando aprovação (há mais de 2 dias)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const { data: waitingApproval } = await supabase
        .from('orders')
        .select('id, display_id, created_at, customer:customers(name)')
        .eq('status', 'waiting_approval')
        .lt('created_at', twoDaysAgo.toISOString())

    // OS aguardando peças
    const { data: waitingParts } = await supabase
        .from('orders')
        .select('id, display_id, created_at, customer:customers(name)')
        .eq('status', 'waiting_parts')

    // Totais rápidos
    const { count: totalOpen } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'analyzing', 'waiting_approval', 'waiting_parts', 'in_progress'])

    const { count: totalReady } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ready')

    const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

    // Ticket médio
    const ticketMedio = yearlyOrders && yearlyOrders.length > 0
        ? yearlyRevenue / yearlyOrders.length
        : 0

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Visão Geral
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Bem-vindo ao {settings?.trade_name || 'WTECH'}
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href="/dashboard/orders/new">
                        <Plus className="mr-2 h-5 w-5" />
                        Nova OS
                    </Link>
                </Button>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">

                {/* Left Column: Metrics & Actions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Cards de Métricas */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Faturamento Anual */}
                        <Card className="bg-card border-white/5 backdrop-blur-sm card-hover animate-fade-in-up" style={{ '--stagger': '0ms' } as React.CSSProperties}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Faturamento {currentYear}
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">
                                    {formatCurrency(yearlyRevenue)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Apenas mão de obra (MEI Safe)
                                </p>
                            </CardContent>
                        </Card>

                        {/* Ticket Médio */}
                        <Card className="bg-card border-white/5 backdrop-blur-sm card-hover animate-fade-in-up" style={{ '--stagger': '80ms' } as React.CSSProperties}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Ticket Médio
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-500">
                                    {formatCurrency(ticketMedio)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Por serviço finalizado
                                </p>
                            </CardContent>
                        </Card>

                        {/* OS em Aberto */}
                        <Card className="bg-card border-white/5 backdrop-blur-sm card-hover animate-fade-in-up" style={{ '--stagger': '160ms' } as React.CSSProperties}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    OS em Andamento
                                </CardTitle>
                                <ClipboardList className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-500">
                                    {totalOpen || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {totalReady || 0} prontas para retirada
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Clientes */}
                        <Card className="bg-card border-white/5 backdrop-blur-sm card-hover animate-fade-in-up" style={{ '--stagger': '240ms' } as React.CSSProperties}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Clientes
                                </CardTitle>
                                <Users className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-500">
                                    {totalCustomers || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Cadastrados no sistema
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Progresso MEI */}
                    <Card className="bg-card border-white/5 backdrop-blur-sm animate-fade-in-up" style={{ '--stagger': '300ms' } as React.CSSProperties}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                Projeção Teto MEI
                            </CardTitle>
                            <CardDescription>
                                Limite configurado: {formatCurrency(meiLimit)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Progress
                                value={Math.min(meiProgress, 100)}
                                className={`h-2 bg-slate-800 ${meiProgress > 90 ? '[&>div]:bg-red-500' :
                                    meiProgress > 70 ? '[&>div]:bg-yellow-500' :
                                        '[&>div]:bg-green-500'
                                    }`}
                            />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {meiProgress.toFixed(1)}% utilizado
                                </span>
                                <span className="font-medium">
                                    Restam {formatCurrency(Math.max(meiLimit - yearlyRevenue, 0))}
                                </span>
                            </div>

                            {meiProgress > 80 && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Atenção!</AlertTitle>
                                    <AlertDescription>
                                        Você atingiu {meiProgress.toFixed(0)}% do seu limite MEI.
                                        Considere revisar seu enquadramento ou ajustar o limite em Configurações.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Atenção Necessária */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Aguardando Aprovação */}
                        <Card className={`bg-card border-white/5 backdrop-blur-sm card-hover ${waitingApproval && waitingApproval.length > 0 ? 'border-yellow-500/50' : ''}`}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                    Aguardando Aprovação
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {waitingApproval && waitingApproval.length > 0 ? (
                                    <div className="space-y-3">
                                        {waitingApproval.slice(0, 3).map((order) => {
                                            const customerData = order.customer as { name: string }[] | null
                                            const customer = customerData?.[0] || null
                                            return (
                                                <div key={order.id} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            OS #{String(order.display_id).padStart(4, '0')}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {customer?.name || 'Cliente'}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                                        <Link href={`/dashboard/orders/${order.id}`}>
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                        {waitingApproval.length > 3 && (
                                            <Button variant="outline" className="w-full text-xs" asChild>
                                                <Link href="/dashboard/orders?status=waiting_approval">
                                                    Ver todas ({waitingApproval.length})
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Tudo em dia!</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Aguardando Peças */}
                        <Card className={`bg-card border-white/5 backdrop-blur-sm card-hover ${waitingParts && waitingParts.length > 0 ? 'border-purple-500/50' : ''}`}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Package className="h-5 w-5 text-purple-500" />
                                    Aguardando Peças
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {waitingParts && waitingParts.length > 0 ? (
                                    <div className="space-y-3">
                                        {waitingParts.slice(0, 3).map((order) => {
                                            const customerData = order.customer as { name: string }[] | null
                                            const customer = customerData?.[0] || null
                                            return (
                                                <div key={order.id} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            OS #{String(order.display_id).padStart(4, '0')}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {customer?.name || 'Cliente'}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                                        <Link href={`/dashboard/orders/${order.id}`}>
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                        {waitingParts.length > 3 && (
                                            <Button variant="outline" className="w-full text-xs" asChild>
                                                <Link href="/dashboard/orders?status=waiting_parts">
                                                    Ver todas ({waitingParts.length})
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Tudo em dia!</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="lg:col-span-1">
                    <DashboardActivityFeed />
                </div>

            </div>

            {/* Atalhos Rápidos */}
            <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto py-6" asChild>
                    <Link href="/dashboard/orders" className="flex flex-col items-center gap-2">
                        <ClipboardList className="h-8 w-8" />
                        <span>Lista de OS</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-auto py-6" asChild>
                    <Link href="/dashboard/customers" className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8" />
                        <span>Clientes</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-auto py-6" asChild>
                    <Link href="/dashboard/metrics" className="flex flex-col items-center gap-2">
                        <TrendingUp className="h-8 w-8" />
                        <span>Métricas Detalhadas</span>
                    </Link>
                </Button>
            </div>
        </div>
    )
}
