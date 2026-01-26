'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Server Action
import { updateOrderStatus } from '../actions'

// Components
import BudgetModal from './budget-modal'

// UI Components
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Icons
import {
    Play,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    FileText,
    Clock,
    Package,
} from 'lucide-react'

interface OrderActionsProps {
    orderId: string
    currentStatus: string
}

export default function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [isBudgetOpen, setIsBudgetOpen] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    async function handleStatusChange(newStatus: string) {
        setIsPending(true)
        setFeedback(null)

        try {
            const result = await updateOrderStatus(orderId, newStatus)

            if (result.success) {
                setFeedback({ type: 'success', message: result.message })
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
        <>
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

                {/* ============================================ */}
                {/* MÁQUINA DE ESTADOS ESTRITA */}
                {/* ============================================ */}

                {/* Status: OPEN → Iniciar Diagnóstico */}
                {currentStatus === 'open' && (
                    <div className="flex flex-wrap gap-2">
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
                    </div>
                )}

                {/* Status: ANALYZING → Finalizar Diagnóstico (abre modal) */}
                {currentStatus === 'analyzing' && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => setIsBudgetOpen(true)}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <FileText className="mr-2 h-4 w-4" />
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
                    </div>
                )}

                {/* Status: WAITING_APPROVAL → TRAVA! Técnico não pode avançar */}
                {currentStatus === 'waiting_approval' && (
                    <Alert variant="warning" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                            Aguardando Aprovação do Cliente
                        </AlertTitle>
                        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                            O orçamento foi enviado. Aguarde o cliente aprovar ou reprovar para continuar.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Status: WAITING_PARTS → Peças Chegaram */}
                {currentStatus === 'waiting_parts' && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => handleStatusChange('in_progress')}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Package className="mr-2 h-4 w-4" />
                            )}
                            Peças Chegaram / Retomar
                        </Button>
                    </div>
                )}

                {/* Status: IN_PROGRESS → Finalizar Serviço */}
                {currentStatus === 'in_progress' && (
                    <div className="flex flex-wrap gap-2">
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
                            Finalizar Serviço
                        </Button>
                    </div>
                )}

                {/* Status: READY → Entregar ao Cliente */}
                {currentStatus === 'ready' && (
                    <div className="flex flex-wrap gap-2">
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
                            Entregar ao Cliente
                        </Button>
                    </div>
                )}

                {/* Status: FINISHED ou CANCELED → Mensagem final */}
                {(currentStatus === 'finished' || currentStatus === 'canceled') && (
                    <Alert variant={currentStatus === 'finished' ? 'success' : 'destructive'}>
                        {currentStatus === 'finished' ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>
                            Esta OS está {currentStatus === 'finished' ? 'finalizada' : 'cancelada'}.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Modal de Orçamento */}
            <BudgetModal
                orderId={orderId}
                open={isBudgetOpen}
                onOpenChange={setIsBudgetOpen}
            />
        </>
    )
}
