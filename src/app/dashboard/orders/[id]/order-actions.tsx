'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Server Action
import { updateOrderStatus } from '../actions'

// UI Components
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Icons
import {
    Play,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
} from 'lucide-react'

interface OrderActionsProps {
    orderId: string
    currentStatus: string
}

export default function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    async function handleStatusChange(newStatus: string) {
        setIsPending(true)
        setFeedback(null)

        try {
            const result = await updateOrderStatus(orderId, newStatus)

            if (result.success) {
                setFeedback({ type: 'success', message: result.message })
                // Refresh da página para atualizar dados
                router.refresh()
            } else {
                setFeedback({ type: 'error', message: result.message })
            }
        } catch (error) {
            setFeedback({
                type: 'error',
                message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
            })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Feedback Alert */}
            {feedback && (
                <Alert variant={feedback.type === 'success' ? 'success' : 'destructive'}>
                    {feedback.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
            )}

            {/* Botões baseados no status atual */}
            <div className="flex flex-wrap gap-2">
                {/* Status: OPEN */}
                {currentStatus === 'open' && (
                    <Button
                        onClick={() => handleStatusChange('analyzing')}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="mr-2 h-4 w-4" />
                        )}
                        Iniciar Diagnóstico
                    </Button>
                )}

                {/* Status: ANALYZING */}
                {currentStatus === 'analyzing' && (
                    <>
                        <Button
                            onClick={() => handleStatusChange('waiting_approval')}
                            disabled={isPending}
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Finalizar Diagnóstico
                        </Button>
                        <Button
                            onClick={() => handleStatusChange('canceled')}
                            disabled={isPending}
                            variant="destructive"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Cancelar OS
                        </Button>
                    </>
                )}

                {/* Status: WAITING_APPROVAL */}
                {currentStatus === 'waiting_approval' && (
                    <>
                        <Button
                            onClick={() => handleStatusChange('waiting_parts')}
                            disabled={isPending}
                            variant="outline"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Aguardando Peças
                        </Button>
                        <Button
                            onClick={() => handleStatusChange('in_progress')}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="mr-2 h-4 w-4" />
                            )}
                            Iniciar Reparo
                        </Button>
                        <Button
                            onClick={() => handleStatusChange('canceled')}
                            disabled={isPending}
                            variant="destructive"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                        </Button>
                    </>
                )}

                {/* Status: WAITING_PARTS */}
                {currentStatus === 'waiting_parts' && (
                    <Button
                        onClick={() => handleStatusChange('in_progress')}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="mr-2 h-4 w-4" />
                        )}
                        Peças Chegaram - Iniciar Reparo
                    </Button>
                )}

                {/* Status: IN_PROGRESS */}
                {currentStatus === 'in_progress' && (
                    <Button
                        onClick={() => handleStatusChange('ready')}
                        disabled={isPending}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Marcar como Pronta
                    </Button>
                )}

                {/* Status: READY */}
                {currentStatus === 'ready' && (
                    <Button
                        onClick={() => handleStatusChange('finished')}
                        disabled={isPending}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Finalizar e Entregar
                    </Button>
                )}

                {/* Status: FINISHED ou CANCELED */}
                {(currentStatus === 'finished' || currentStatus === 'canceled') && (
                    <p className="text-sm text-muted-foreground italic">
                        Esta OS está {currentStatus === 'finished' ? 'finalizada' : 'cancelada'}.
                    </p>
                )}
            </div>
        </div>
    )
}
