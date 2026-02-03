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
import type { TechnicalReport } from '@/types/technical-report'

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
    MessageCircle,
} from 'lucide-react'

interface OrderActionsProps {
    orderId: string
    currentStatus: string
    orderData?: OrderData
    storeSettings?: StoreSettings
    customerName: string
    displayId: number | string
    technicalReport?: TechnicalReport | null
    problemDescription?: string
    discountAmount?: number
}

export default function OrderActions({
    orderId,
    currentStatus,
    orderData,
    storeSettings,
    customerName,
    displayId,
    technicalReport,
    problemDescription,
    discountAmount = 0
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
                {/* TOOLBAR: Ações Principais - Mobile-first vertical stack */}
                <div className="flex flex-col gap-3">

                    {/* Status-based Action Buttons */}
                    <div className="flex flex-col gap-2">

                        {/* Status: OPEN → Iniciar Diagnóstico */}
                        {currentStatus === 'open' && (
                            <>
                                <Button
                                    onClick={() => handleStatusChange('analyzing')}
                                    disabled={isPending}
                                    className="w-full bg-primary shadow-sm"
                                >
                                    {isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Play className="mr-2 h-4 w-4" />
                                    )}
                                    Iniciar Análise
                                </Button>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => router.push(`/os/${displayId}/checkin`)}
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    Check-in / Retirar
                                </Button>
                            </>
                        )}

                        {/* Status: ANALYZING → Finalizar Diagnóstico */}
                        {currentStatus === 'analyzing' && (
                            <>
                                <Button
                                    onClick={() => setIsBudgetOpen(true)}
                                    disabled={isPending}
                                    className="w-full bg-green-600 hover:bg-green-700 shadow-sm"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Finalizar Diagnóstico
                                </Button>
                                <Button
                                    onClick={() => handleStatusChange('canceled')}
                                    disabled={isPending}
                                    variant="ghost"
                                    className="w-full text-muted-foreground hover:text-destructive"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar OS
                                </Button>
                            </>
                        )}

                        {/* Status: WAITING_PARTS → Confirmar Chegada da Peça */}
                        {currentStatus === 'waiting_parts' && (
                            <Button
                                onClick={handleConfirmPartArrival}
                                disabled={isPending}
                                variant="secondary"
                                className="w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 border"
                            >
                                {isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                )}
                                🔓 Confirmar Peças
                            </Button>
                        )}

                        {/* Status: IN_PROGRESS → Finalizar Serviço */}
                        {currentStatus === 'in_progress' && (
                            <Button
                                onClick={() => setIsFinishOpen(true)}
                                disabled={isPending}
                                className="w-full bg-green-600 hover:bg-green-700 shadow-sm"
                            >
                                <Receipt className="mr-2 h-4 w-4" />
                                Finalizar Serviço
                            </Button>
                        )}

                        {/* Status: READY → Entregar ao Cliente */}
                        {currentStatus === 'ready' && (
                            <>
                                <Button
                                    onClick={() => setIsFinishOpen(true)}
                                    disabled={isPending}
                                    className="w-full bg-green-600 hover:bg-green-700 shadow-sm"
                                >
                                    <Receipt className="mr-2 h-4 w-4" />
                                    Finalizar Entrega
                                </Button>
                                <PdfButtonWrapper orderData={orderData!} storeSettings={storeSettings!} className="w-full" />
                            </>
                        )}

                        {/* Status: FINISHED → Ações Finais */}
                        {currentStatus === 'finished' && (
                            <>
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                    onClick={() => {
                                        const phone = orderData?.customerPhone?.replace(/\D/g, '') || ''
                                        if (!phone) {
                                            alert('Cliente sem telefone cadastrado.')
                                            return
                                        }
                                        const whatsappUrl = new URL('https://api.whatsapp.com/send')
                                        whatsappUrl.searchParams.append('phone', `55${phone}`)
                                        whatsappUrl.searchParams.append('text', `Olá ${customerName}! 👋\n\nSua ordem de serviço #${displayId} foi finalizada. Poderia avaliar nosso atendimento rapidinho? Leva menos de 1 minuto e nos ajuda muito!\n\n👉 ${window.location.origin}/feedback/${orderId}\n\nObrigado!`)
                                        window.open(whatsappUrl.toString(), '_blank')
                                    }}
                                >
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Pedir Avaliação
                                </Button>
                                <PdfButtonWrapper orderData={orderData!} storeSettings={storeSettings!} className="w-full" />
                                <Button
                                    variant="outline"
                                    onClick={handleReopen}
                                    disabled={isPending}
                                    className="w-full border-dashed text-muted-foreground"
                                >
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Reabrir OS
                                </Button>
                            </>
                        )}

                        {/* Status: CANCELED → Reabrir */}
                        {currentStatus === 'canceled' && (
                            <Button
                                variant="outline"
                                onClick={handleReopen}
                                disabled={isPending}
                                className="w-full border-dashed text-muted-foreground"
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Reabrir OS
                            </Button>
                        )}
                    </div>

                    {/* Compartilhar - Always visible */}
                    <ShareActions
                        orderId={orderId}
                        displayId={displayId}
                        customerName={customerName}
                        storeName={storeSettings?.trade_name}
                        className="w-full"
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
                    <Alert variant={currentStatus === 'finished' ? 'success' : 'destructive'} className="my-6">
                        {currentStatus === 'finished' ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        <AlertDescription className="font-medium">
                            Esta OS está {currentStatus === 'finished' ? 'finalizada' : 'cancelada'}.
                        </AlertDescription>
                    </Alert>
                )}

                {/* ZONA DE PERIGO */}
                <div className="pt-6 border-t">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-red-800 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Zona de Perigo
                            </h4>
                            <p className="text-xs text-red-600/80 dark:text-red-400/80">
                                Ações irreversíveis. Cuidado.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full sm:w-auto text-red-700 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir OS
                        </Button>
                    </div>
                </div>

                <BudgetModal
                    orderId={orderId}
                    displayId={displayId}
                    open={isBudgetOpen}
                    onOpenChange={setIsBudgetOpen}
                    technicalReport={technicalReport}
                    equipmentContext={orderData ? `${orderData.equipmentType} ${orderData.equipmentBrand} ${orderData.equipmentModel}`.trim() : ''}
                    problemDescription={problemDescription}
                />

                <FinishOrderModal
                    orderId={orderId}
                    open={isFinishOpen}
                    onOpenChange={setIsFinishOpen}
                    orderData={orderData}
                    storeSettings={storeSettings}
                    discountAmount={discountAmount}
                />
            </div >
        </>
    )
}
