import Link from 'next/link'
import {
    Shield,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    MessageSquare,
    Phone,
    SkipForward,
    ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TabsContent } from '@/components/ui/tabs'
import { ResponsiveTabs } from '@/components/ui/responsive-tabs'
import { getFollowUps, getActiveWarranties, getFollowUpStats } from './actions'
import { FollowUpActions } from './follow-up-actions'

export const dynamic = 'force-dynamic'

// Type labels
const typeLabels: Record<string, { label: string; color: string }> = {
    post_delivery: { label: 'Pós-Entrega', color: 'bg-blue-500/10 text-blue-500' },
    warranty_check: { label: 'Check Garantia', color: 'bg-purple-500/10 text-purple-500' },
    warranty_expiring: { label: 'Garantia Vencendo', color: 'bg-orange-500/10 text-orange-500' },
    manual: { label: 'Manual', color: 'bg-gray-500/10 text-gray-500' },
}

export default async function FollowUpsPage() {
    const [pendingFollowUps, completedFollowUps, warranties, stats] = await Promise.all([
        getFollowUps('pending'),
        getFollowUps('completed'),
        getActiveWarranties(),
        getFollowUpStats()
    ])

    const today = new Date().toISOString().split('T')[0]
    const overdueFollowUps = pendingFollowUps.filter(f => f.scheduled_for <= today)
    const upcomingFollowUps = pendingFollowUps.filter(f => f.scheduled_for > today)

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Follow-ups</h1>
                <p className="text-muted-foreground">Acompanhamento de clientes e garantias</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Garantias Ativas</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2">
                            {stats.activeWarranties}
                            <Shield className="h-5 w-5 text-green-500" />
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className={stats.pendingToday > 0 ? 'border-orange-500/50' : ''}>
                    <CardHeader className="pb-2">
                        <CardDescription>Pendentes Hoje</CardDescription>
                        <CardTitle className={`text-3xl flex items-center gap-2 ${stats.pendingToday > 0 ? 'text-orange-500' : ''}`}>
                            {stats.pendingToday}
                            <Clock className="h-5 w-5" />
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className={stats.expiringIn7Days > 0 ? 'border-yellow-500/50' : ''}>
                    <CardHeader className="pb-2">
                        <CardDescription>Vencem em 7 dias</CardDescription>
                        <CardTitle className={`text-3xl flex items-center gap-2 ${stats.expiringIn7Days > 0 ? 'text-yellow-500' : ''}`}>
                            {stats.expiringIn7Days}
                            <AlertTriangle className="h-5 w-5" />
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Feitos esta semana</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2">
                            {stats.completedThisWeek}
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Main Content */}
            <ResponsiveTabs
                defaultValue="pending"
                items={[
                    {
                        value: 'pending',
                        label: (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Pendentes
                                {pendingFollowUps.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">{pendingFollowUps.length}</Badge>
                                )}
                            </div>
                        )
                    },
                    {
                        value: 'warranties',
                        label: (
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Garantias
                            </div>
                        )
                    },
                    {
                        value: 'history',
                        label: (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Histórico
                            </div>
                        )
                    }
                ]}
            >

                {/* Pending Follow-ups */}
                <TabsContent value="pending" className="space-y-4">
                    {overdueFollowUps.length > 0 && (
                        <Card className="border-orange-500/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-orange-500 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Atrasados ou para Hoje ({overdueFollowUps.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {overdueFollowUps.map(followUp => (
                                    <FollowUpItem key={followUp.id} followUp={followUp} isOverdue />
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {upcomingFollowUps.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Próximos ({upcomingFollowUps.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {upcomingFollowUps.map(followUp => (
                                    <FollowUpItem key={followUp.id} followUp={followUp} />
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {pendingFollowUps.length === 0 && (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Nenhum follow-up pendente!</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Active Warranties */}
                <TabsContent value="warranties">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Garantias Ativas ({warranties.length})</CardTitle>
                            <CardDescription>Equipamentos ainda na garantia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {warranties.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Nenhuma garantia ativa no momento</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {warranties.map((order: any) => {
                                        const daysRemaining = Math.ceil(
                                            (new Date(order.warranty_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                        )
                                        const isExpiringSoon = daysRemaining <= 7

                                        return (
                                            <div
                                                key={order.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border ${isExpiringSoon ? 'border-yellow-500/50 bg-yellow-500/5' : 'hover:bg-muted/50'
                                                    }`}
                                            >
                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="flex-1 min-w-0"
                                                >
                                                    <div className="font-medium">
                                                        OS {order.display_id} - {order.customer?.name || 'Cliente'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {order.equipments?.brand} {order.equipments?.model}
                                                    </div>
                                                </Link>

                                                <Badge
                                                    variant={isExpiringSoon ? 'destructive' : 'secondary'}
                                                    className={isExpiringSoon ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                                                >
                                                    {daysRemaining} dias restantes
                                                </Badge>

                                                {order.customer?.phone && (
                                                    <FollowUpActions
                                                        followUpId={null}
                                                        orderId={order.id}
                                                        displayId={order.display_id}
                                                        customerName={order.customer?.name || 'Cliente'}
                                                        customerPhone={order.customer?.phone}
                                                        deviceType={order.equipments?.model || null}
                                                        type="warranty_expiring"
                                                        daysRemaining={daysRemaining}
                                                    />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Histórico</CardTitle>
                            <CardDescription>Follow-ups já realizados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {completedFollowUps.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Nenhum follow-up realizado ainda</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {completedFollowUps.map(followUp => (
                                        <div
                                            key={followUp.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                                        >
                                            <div className={`p-2 rounded-full ${followUp.status === 'completed'
                                                ? 'bg-green-500/10'
                                                : 'bg-gray-500/10'
                                                }`}>
                                                {followUp.status === 'completed'
                                                    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    : <SkipForward className="h-4 w-4 text-gray-500" />
                                                }
                                            </div>

                                            <Link
                                                href={`/dashboard/orders/${followUp.order_id}`}
                                                className="flex-1 min-w-0"
                                            >
                                                <div className="font-medium">
                                                    OS {followUp.order?.display_id} - {followUp.order?.customer?.name || 'Cliente'}
                                                </div>
                                                {followUp.notes && (
                                                    <div className="text-sm text-muted-foreground truncate">
                                                        {followUp.notes}
                                                    </div>
                                                )}
                                            </Link>

                                            <Badge className={typeLabels[followUp.type]?.color || ''}>
                                                {typeLabels[followUp.type]?.label || followUp.type}
                                            </Badge>

                                            <span className="text-xs text-muted-foreground shrink-0">
                                                {new Date(followUp.completed_at || followUp.skipped_at || '').toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </ResponsiveTabs>
        </div>
    )
}

// Follow-up item component
function FollowUpItem({ followUp, isOverdue = false }: { followUp: any; isOverdue?: boolean }) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${isOverdue ? 'bg-orange-500/5 border-orange-500/30' : 'hover:bg-muted/50'
            }`}>
            <Badge className={typeLabels[followUp.type]?.color || ''}>
                {typeLabels[followUp.type]?.label || followUp.type}
            </Badge>

            <Link
                href={`/dashboard/orders/${followUp.order_id}`}
                className="flex-1 min-w-0"
            >
                <div className="font-medium">
                    OS {followUp.order?.display_id} - {followUp.order?.customer?.name || 'Cliente'}
                </div>
                <div className="text-sm text-muted-foreground">
                    {followUp.order?.equipments?.brand} {followUp.order?.equipments?.model}
                </div>
            </Link>

            <span className={`text-xs shrink-0 ${isOverdue ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
                {new Date(followUp.scheduled_for).toLocaleDateString('pt-BR')}
            </span>

            {followUp.order?.customer?.phone && (
                <FollowUpActions
                    followUpId={followUp.id}
                    orderId={followUp.order_id}
                    displayId={followUp.order?.display_id}
                    customerName={followUp.order?.customer?.name || 'Cliente'}
                    customerPhone={followUp.order?.customer?.phone}
                    deviceType={followUp.order?.equipments?.model || null}
                    type={followUp.type}
                />
            )}
        </div>
    )
}
