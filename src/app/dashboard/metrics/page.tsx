import { getMonthlyMetrics } from '../orders/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

// Icons
import {
    DollarSign,
    TrendingUp,
    Receipt,
    ShoppingCart,
    AlertTriangle,
    CheckCircle,
    Target,
} from 'lucide-react'

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

export default async function MetricsPage() {
    const result = await getMonthlyMetrics()

    if (!result.success || !result.data) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erro ao carregar métricas</AlertTitle>
                    <AlertDescription>{result.message}</AlertDescription>
                </Alert>
            </div>
        )
    }

    const {
        meiRevenue,
        clientSavings,
        totalReceived,
        ordersCount,
        avgTicket,
        meiMonthlyLimit,
        meiLimitPercent,
    } = result.data

    // Definir cor do progresso baseado no percentual
    const progressColor = meiLimitPercent >= 90
        ? 'bg-red-500'
        : meiLimitPercent >= 70
            ? 'bg-yellow-500'
            : 'bg-green-500'

    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">📊 Dashboard Financeiro</h1>
                <p className="text-muted-foreground">
                    Métricas de {currentMonth} • Modelo MEI Safe
                </p>
            </div>

            {/* Alerta MEI */}
            {meiLimitPercent >= 80 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>⚠️ Atenção ao Limite MEI</AlertTitle>
                    <AlertDescription>
                        Você já utilizou {meiLimitPercent}% do limite mensal recomendado.
                        Considere consultar um contador.
                    </AlertDescription>
                </Alert>
            )}

            {/* Cards de Métricas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Faturamento MEI (Mão de Obra) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Faturamento Real
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(meiRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Apenas mão de obra (MEI Safe)
                        </p>
                    </CardContent>
                </Card>

                {/* Total Recebido */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Recebido
                        </CardTitle>
                        <Receipt className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(totalReceived)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pagamentos registrados
                        </p>
                    </CardContent>
                </Card>

                {/* Economia do Cliente */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Economia Gerada
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(clientSavings)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Peças compradas pelo cliente
                        </p>
                    </CardContent>
                </Card>

                {/* Ticket Médio */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ticket Médio
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(avgTicket)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {ordersCount} OS finalizada(s)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Barra de Progresso MEI */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Limite MEI Mensal
                    </CardTitle>
                    <CardDescription>
                        Faturamento recomendado: {formatCurrency(meiMonthlyLimit)}/mês
                        (R$ 81.000/ano ÷ 12)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Utilizado: {formatCurrency(meiRevenue)}</span>
                            <span className={meiLimitPercent >= 80 ? 'text-red-600 font-bold' : ''}>
                                {meiLimitPercent}%
                            </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full ${progressColor} transition-all`}
                                style={{ width: `${Math.min(meiLimitPercent, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>R$ 0</span>
                            <span>Limite: {formatCurrency(meiMonthlyLimit)}</span>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 pt-2">
                        {meiLimitPercent < 70 ? (
                            <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">
                                    Situação saudável! Continue assim.
                                </span>
                            </>
                        ) : meiLimitPercent < 90 ? (
                            <>
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm text-yellow-600">
                                    Atenção! Monitorando limite.
                                </span>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-red-600">
                                    Alerta! Próximo do limite MEI.
                                </span>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Info Box */}
            <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertTitle>💡 Modelo Compra Assistida</AlertTitle>
                <AlertDescription className="text-sm">
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>
                            <strong>Faturamento Real:</strong> Soma apenas a mão de obra das OS finalizadas
                        </li>
                        <li>
                            <strong>Economia Gerada:</strong> Valor das peças que o cliente comprou diretamente
                            (não passa pelo seu CNPJ)
                        </li>
                        <li>
                            <strong>Limite MEI 2026:</strong> R$ 81.000/ano (~R$ 6.750/mês)
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
    )
}
