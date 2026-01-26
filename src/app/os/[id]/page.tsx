import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'

// UI Components
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Icons
import {
    Wrench,
    FileText,
    ShoppingCart,
    Receipt,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
    XCircle,
} from 'lucide-react'

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
    waiting_parts: 'Aguardando você comprar e entregar as peças.',
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

export default async function ClientOrderPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Buscar ordem com itens
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items(*)
    `)
        .eq('id', id)
        .single()

    if (error || !order) {
        notFound()
    }

    // Filtrar apenas peças externas
    const externalParts = order.order_items?.filter(
        (item: { type: string }) => item.type === 'part_external'
    ) || []

    const showApprovalButtons = order.status === 'waiting_approval'
    const isFinishedOrCanceled = order.status === 'finished' || order.status === 'canceled'

    return (
        <div className="min-h-screen bg-muted/30 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg">WTECH</span>
                    </div>
                    <Badge variant={order.status as OrderStatus} className="text-sm">
                        {statusLabels[order.status as OrderStatus] || order.status}
                    </Badge>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
                {/* Status Alert */}
                <Alert variant={isFinishedOrCanceled ? (order.status === 'finished' ? 'success' : 'destructive') : 'info'}>
                    {order.status === 'finished' ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : order.status === 'canceled' ? (
                        <XCircle className="h-4 w-4" />
                    ) : (
                        <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertTitle>OS #{String(order.display_id).padStart(4, '0')}</AlertTitle>
                    <AlertDescription>
                        {statusDescriptions[order.status as OrderStatus]}
                    </AlertDescription>
                </Alert>

                {/* Card: Diagnóstico */}
                {order.diagnosis_text && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-5 w-5 text-primary" />
                                Diagnóstico Técnico
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                {order.diagnosis_text}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Card: Peças Necessárias */}
                {externalParts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                Peças Necessárias
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Aviso Compra Assistida */}
                            <Alert variant="warning">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    As peças devem ser compradas por você e entregues na assistência.
                                </AlertDescription>
                            </Alert>

                            {/* Lista de Peças */}
                            <div className="space-y-3">
                                {externalParts.map((part: { id: string; title: string; external_url: string | null }) => (
                                    <div
                                        key={part.id}
                                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                    >
                                        <span className="text-sm font-medium">{part.title}</span>
                                        {part.external_url && (
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={part.external_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    Comprar
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Card: Resumo Financeiro */}
                <Card>
                    <CardHeader>
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

                        {externalParts.length > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Peças (você compra)</span>
                                <span className="text-muted-foreground italic">Ver links acima</span>
                            </div>
                        )}

                        <hr className="my-2" />

                        <div className="flex justify-between text-lg font-bold">
                            <span>Total a Pagar</span>
                            <span className="text-primary">{formatCurrency(order.labor_cost || 0)}</span>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            * Este é o valor da mão de obra. Peças são pagas diretamente nos links.
                        </p>
                    </CardContent>
                </Card>
            </main>

            {/* Footer Fixo - Botões de Aprovação */}
            {showApprovalButtons && (
                <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-bottom">
                    <div className="container mx-auto max-w-lg flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            asChild
                        >
                            <Link href={`/os/${id}/reprovar`}>
                                <XCircle className="mr-2 h-5 w-5" />
                                Reprovar
                            </Link>
                        </Button>
                        <Button
                            className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                            asChild
                        >
                            <Link href={`/os/${id}/aprovar`}>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Aprovar Orçamento
                            </Link>
                        </Button>
                    </div>
                </footer>
            )}

            {/* Footer para status finalizados */}
            {isFinishedOrCanceled && (
                <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
                    <div className="container mx-auto max-w-lg text-center">
                        <p className="text-sm text-muted-foreground">
                            {order.status === 'finished'
                                ? '✅ Serviço concluído com sucesso!'
                                : '❌ Este serviço foi cancelado.'}
                        </p>
                    </div>
                </footer>
            )}
        </div>
    )
}
