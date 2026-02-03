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
                {/* ====== SEÇÃO 1: AÇÃO PRINCIPAL (CTA) ====== */}
                <div className="space-y-3">
                    {/* Status: OPEN */}
                    {currentStatus === 'open' && (
                        <div className="grid grid-cols-2 gap-2">
                            <Link href={`/os/${displayId}/checkin`} passHref className="col-span-1">
                                <Button variant="outline" className="w-full">
                                    <Package className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Retirar</span>
                                    <span className="sm:hidden">Retirar</span>
                                </Button>
                            </Link>
                            <Button
                                onClick={() => handleStatusChange('analyzing')}
                                disabled={isPending}
                                className="col-span-1 bg-primary"
                            >
                                {isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="mr-2 h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">Iniciar Análise</span>
                                <span className="sm:hidden">Iniciar</span>
                            </Button>
                        </div>
                    )}

                    {/* Status: ANALYZING */}
                    {currentStatus === 'analyzing' && (
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                onClick={() => setIsBudgetOpen(true)}
                                disabled={isPending}
                                className="col-span-2 bg-green-600 hover:bg-green-700"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Finalizar Diagnóstico</span>
                                <span className="sm:hidden">Diagnóstico</span>
                            </Button>
                            <Button
                                onClick={() => handleStatusChange('canceled')}
                                disabled={isPending}
                                variant="destructive"
                                className="col-span-1"
                            >
                                <XCircle className="h-4 w-4" />
                                <span className="hidden sm:inline ml-2">Cancelar</span>
                            </Button>
                        </div>
                    )}

                    {/* Status: WAITING_PARTS */}
                    {currentStatus === 'waiting_parts' && (
                        <Button
                            onClick={handleConfirmPartArrival}
                            disabled={isPending}
                            className="w-full border-blue-200 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <PackageCheck className="mr-2 h-4 w-4" />
                            )}
                            Confirmar Chegada das Peças
                        </Button>
                    )}

                    {/* Status: IN_PROGRESS */}
                    {currentStatus === 'in_progress' && (
                        <Button
                            onClick={() => setIsFinishOpen(true)}
                            disabled={isPending}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <Receipt className="mr-2 h-4 w-4" />
                            Finalizar Serviço
                        </Button>
                    )}

                    {/* Status: READY */}
                    {currentStatus === 'ready' && (
                        <Button
                            onClick={() => setIsFinishOpen(true)}
                            disabled={isPending}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <Receipt className="mr-2 h-4 w-4" />
                            Entregar ao Cliente
                        </Button>
                    )}

                    {/* Status: FINISHED - Primary: Enviar Avaliação */}
                    {currentStatus === 'finished' && (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                            Pedir Avaliação via WhatsApp
                        </Button>
                    )}
                </div>

                {/* ====== SEÇÃO 2: AÇÕES SECUNDÁRIAS ====== */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {/* Compartilhar - Sempre visível */}
                    <ShareActions
                        orderId={orderId}
                        displayId={displayId}
                        customerName={customerName}
                        storeName={storeSettings?.trade_name}
                    />

                    {/* PDF - Quando finalizado ou pronto */}
                    {(currentStatus === 'finished' || currentStatus === 'ready') && (
                        <PdfButtonWrapper orderData={orderData!} storeSettings={storeSettings!} />
                    )}

                    {/* Reabrir - Quando finalizado ou cancelado */}
                    {(currentStatus === 'finished' || currentStatus === 'canceled') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReopen}
                            disabled={isPending}
                            className="border-dashed"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reabrir
                        </Button>
                    )}
                </div>

                {/* ====== SEÇÃO 3: FEEDBACK ALERT ====== */}
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

                {/* ====== SEÇÃO 4: STATUS ALERTS ====== */}
                {currentStatus === 'waiting_approval' && (
                    <Alert variant="warning" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                            Aguardando Aprovação
                        </AlertTitle>
                        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                            O orçamento foi enviado. Aguarde o cliente aprovar ou reprovar.
                        </AlertDescription>
                    </Alert>
                )}

                {currentStatus === 'waiting_parts' && (
                    <Alert variant="info" className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                        <Package className="h-5 w-5 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200">
                            Aguardando Peças
                        </AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                            O cliente precisa comprar e entregar as peças.
                        </AlertDescription>
                    </Alert>
                )}

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

                {/* ====== SEÇÃO 5: ZONA DE PERIGO (Colapsável) ====== */}
                <details className="pt-4 border-t group">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Zona de Perigo</span>
                    </summary>
                    <div className="mt-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50">
                        <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                            Ação irreversível. Esta OS será permanentemente excluída.
                        </p>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Permanentemente
                        </Button>
                    </div>
                </details>

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
            </div>
        </>
    )
}
