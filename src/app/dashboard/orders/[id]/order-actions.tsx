'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Server Actions
import { updateOrderStatus, confirmPartArrival, deleteOrder } from '../actions'

// Components
import BudgetModal from './budget-modal'
import FinishOrderModal from './finish-order-modal'
import PdfButtonWrapper from './pdf-button-wrapper'
import ShareActions from '@/components/share-actions'

// Types
import type { OrderData, StoreSettings } from '@/components/warranty-pdf'

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
    PackageCheck,
    Receipt,
    Trash2,
    RefreshCcw,
} from 'lucide-react'

interface OrderActionsProps {
    orderId: string
    currentStatus: string
    orderData?: OrderData
    storeSettings?: StoreSettings
    customerName: string
    displayId: number
}

export default function OrderActions({
    orderId,
    currentStatus,
    orderData,
    storeSettings,
    customerName,
    displayId
}: OrderActionsProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [isBudgetOpen, setIsBudgetOpen] = useState(false)
    const [isFinishOpen, setIsFinishOpen] = useState(false)
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

    async function handleConfirmPartArrival() {
        // Confirmação extra para ação manual
        if (!window.confirm('Confirma que as peças chegaram? Isso moverá a OS para "Em Reparo".')) {
            return
        }

        setIsPending(true)
        setFeedback(null)

        try {
            const result = await confirmPartArrival(orderId, 'admin')

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

    async function handleDelete() {
        if (!window.confirm('TEM CERTEZA? Essa ação é IRREVERSÍVEL e apagará todo o histórico dessa OS.')) {
            return
        }

        setIsPending(true)
        try {
            const result = await deleteOrder(orderId)
            if (result.success) {
                router.push('/dashboard/orders')
            } else {
                setFeedback({ type: 'error', message: result.message })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsPending(false)
        }
    }

    async function handleReopen() {
        if (!window.confirm('Deseja reabrir esta OS? Ela voltará para o status "Aberta".')) {
            return
        }
        await handleStatusChange('open')
    }

    return (
        <>
            <div className="space-y-4">
                {/* TOOLBAR: Ações Principais + Compartilhar */}
                <div className="flex flex-wrap items-center justify-end gap-2 [&>button]:w-full sm:[&>button]:w-auto">

                    {/* Botões de Ação por Status */}

                    {/* Status: OPEN → Iniciar Diagnóstico */}
                    {/* Status: OPEN → Iniciar Diagnóstico */}
                    {currentStatus === 'open' && (
                        <>
                            <Link href={`/os/${displayId}/checkin`} passHref>
                                <Button className="w-full sm:w-auto" variant="outline">
                                    <Package className="mr-2 h-4 w-4" />
                                    Retirar Equipamento
                                </Button>
                            </Link>
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
                        </>
                    )}

                    {/* Status: ANALYZING → Finalizar Diagnóstico (abre modal de orçamento) */}
                    {currentStatus === 'analyzing' && (
                        <>
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
                                Cancelar
                            </Button>
                        </>
                    )}

                    {/* Status: WAITING_PARTS → Confirmar Chegada da Peça */}
                    {currentStatus === 'waiting_parts' && (
                        <Button
                            onClick={handleConfirmPartArrival}
                            disabled={isPending}
                            variant="secondary"
                            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 border"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <PackageCheck className="mr-2 h-4 w-4" />
                            )}
                            🔓 Confirmar Chegada Manualmente
                        </Button>
                    )}

                    {/* Status: IN_PROGRESS → Finalizar Serviço */}
                    {currentStatus === 'in_progress' && (
                        <Button
                            onClick={() => setIsFinishOpen(true)}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Receipt className="mr-2 h-4 w-4" />
                            Finalizar
                        </Button>
                    )}

                    {/* Status: READY → Entregar ao Cliente */}
                    {currentStatus === 'ready' && (
                        <>
                            <Button
                                onClick={() => setIsFinishOpen(true)}
                                disabled={isPending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Receipt className="mr-2 h-4 w-4" />
                                Finalizar
                            </Button>
                            <PdfButtonWrapper orderData={orderData!} storeSettings={storeSettings!} />
                        </>
                    )}

                    {/* Status: FINISHED ou CANCELED -> Ações Finais */}
                    {(currentStatus === 'finished' || currentStatus === 'canceled') && (
                        <>
                            <Button variant="outline" onClick={handleReopen} disabled={isPending}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Reabrir
                            </Button>

                            {currentStatus === 'finished' && (
                                <PdfButtonWrapper orderData={orderData!} storeSettings={storeSettings!} />
                            )}
                        </>
                    )}

                    {/* Compartilhar (Sempre visível e alinhado) */}
                    <ShareActions
                        orderId={orderId}
                        displayId={displayId}
                        customerName={customerName}
                        storeName={storeSettings?.trade_name}
                    />
                </div>

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

                {/* STATUS ALERTS (Aparecem abaixo da toolbar) */}

                {/* Status: WAITING_APPROVAL → TRAVA! Técnico aguarda cliente */}
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

                {/* Status: WAITING_PARTS → Alert info */}
                {currentStatus === 'waiting_parts' && (
                    <Alert variant="info" className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                        <Package className="h-5 w-5 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200">
                            Aguardando Peças do Cliente
                        </AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                            O cliente precisa comprar e entregar as peças.
                        </AlertDescription>
                    </Alert>
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

                {/* ZONA DE PERIGO */}
                <div className="pt-8 mt-8 border-t">
                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-100 dark:border-red-900/50">
                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Zona de Perigo
                        </h4>
                        <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                            Ações destrutivas que não podem ser desfeitas.
                        </p>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir esta OS Definitivamente
                        </Button>
                    </div>
                </div>

                <BudgetModal
                    orderId={orderId}
                    displayId={displayId}
                    open={isBudgetOpen}
                    onOpenChange={setIsBudgetOpen}
                />

                <FinishOrderModal
                    orderId={orderId}
                    open={isFinishOpen}
                    onOpenChange={setIsFinishOpen}
                    orderData={orderData}
                    storeSettings={storeSettings}
                />
            </div>
        </>
    )
}
