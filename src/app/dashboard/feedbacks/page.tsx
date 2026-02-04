import Link from 'next/link'
import { Star, MessageSquare, TrendingUp, MousePointer2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFeedbacks, getFeedbackStats } from './actions'

export const dynamic = 'force-dynamic'

export default async function FeedbacksPage() {
    const [feedbacks, stats] = await Promise.all([
        getFeedbacks(),
        getFeedbackStats()
    ])

    const lowRatings = feedbacks.filter(f => f.score <= 2)

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Feedbacks</h1>
                <p className="text-muted-foreground">Avaliações internas dos clientes</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total</CardDescription>
                        <CardTitle className="text-3xl">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Média</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2">
                            {stats.averageScore}
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Cliques no Google</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2">
                            {stats.googleClickRate}%
                            <MousePointer2 className="h-5 w-5 text-blue-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        De quem deu 4-5 estrelas
                    </CardContent>
                </Card>

                <Card className={lowRatings.length > 0 ? 'border-red-500/50' : ''}>
                    <CardHeader className="pb-2">
                        <CardDescription>Atenção</CardDescription>
                        <CardTitle className={`text-3xl flex items-center gap-2 ${lowRatings.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {lowRatings.length}
                            <AlertTriangle className={`h-5 w-5 ${lowRatings.length > 0 ? 'text-red-500' : 'text-green-500'}`} />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Avaliações 1-2 estrelas
                    </CardContent>
                </Card>
            </div>

            {/* Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Distribuição</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 items-end h-24">
                        {stats.distribution.map(({ score, count }) => {
                            const maxCount = Math.max(...stats.distribution.map(d => d.count), 1)
                            const height = (count / maxCount) * 100
                            return (
                                <div key={score} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className={`w-full rounded-t transition-all ${score <= 2 ? 'bg-red-500' : score === 3 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                                    />
                                    <span className="text-xs font-medium">{score}★</span>
                                    <span className="text-xs text-muted-foreground">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Low Ratings Alert */}
            {lowRatings.length > 0 && (
                <Card className="border-red-500/50 bg-red-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg text-red-500 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Avaliações que precisam de atenção
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {lowRatings.map(feedback => (
                            <div key={feedback.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                                <div className="flex items-center gap-1 shrink-0">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < feedback.score ? 'fill-red-400 text-red-400' : 'text-muted'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/dashboard/orders/${feedback.order_id}`}
                                        className="font-medium hover:underline"
                                    >
                                        OS {feedback.order?.display_id} - {feedback.order?.customer?.name || 'Cliente'}
                                    </Link>
                                    {feedback.comment && (
                                        <p className="text-sm text-muted-foreground mt-1">{feedback.comment}</p>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* All Feedbacks */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Todos os Feedbacks</CardTitle>
                    <CardDescription>{feedbacks.length} avaliações</CardDescription>
                </CardHeader>
                <CardContent>
                    {feedbacks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum feedback recebido ainda</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {feedbacks.map(feedback => (
                                <div
                                    key={feedback.id}
                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3 w-3 ${i < feedback.score
                                                        ? feedback.score <= 2
                                                            ? 'fill-red-400 text-red-400'
                                                            : feedback.score === 3
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'fill-green-400 text-green-400'
                                                        : 'text-muted'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <Link
                                        href={`/dashboard/orders/${feedback.order_id}`}
                                        className="flex-1 min-w-0 hover:underline truncate"
                                    >
                                        <span className="font-medium">OS {feedback.order?.display_id}</span>
                                        <span className="text-muted-foreground"> - {feedback.order?.customer?.name || 'Cliente'}</span>
                                    </Link>

                                    {feedback.comment && (
                                        <Badge variant="outline" className="shrink-0">
                                            <MessageSquare className="h-3 w-3 mr-1" />
                                            Comentário
                                        </Badge>
                                    )}

                                    {feedback.clicked_google_review && (
                                        <Badge variant="secondary" className="shrink-0 bg-blue-500/10 text-blue-500">
                                            <MousePointer2 className="h-3 w-3 mr-1" />
                                            Google
                                        </Badge>
                                    )}

                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
