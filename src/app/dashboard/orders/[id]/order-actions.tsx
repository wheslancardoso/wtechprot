'use client' // Required for useState and useRouter hooks

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    MoreHorizontal,
    MoreVertical,
    Share2,
    FileDown,
    ArrowLeft
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
        <div className="space-y-4">

            {/* ====== SEÇÃO 1: FEEDBACK & ALERTS ====== */}
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

            {currentStatus === 'waiting_approval' && (
                <Alert variant="warning" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
                    <Clock className="h-5 w-5" />
                    <AlertTitle>Aguardando Aprovação</AlertTitle>
                    <AlertDescription>O orçamento foi enviado. Aguarde o cliente aprovar.</AlertDescription>
                </Alert>
            )}

            {currentStatus === 'waiting_parts' && (
                <Alert variant="info" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
                    <Package className="h-5 w-5" />
                    <AlertTitle>Aguardando Peças</AlertTitle>
                    <AlertDescription>O cliente precisa comprar e entregar as peças.</AlertDescription>
                </Alert>
            )}

            {(currentStatus === 'finished' || currentStatus === 'canceled') && (
                <Alert variant={currentStatus === 'finished' ? 'success' : 'destructive'} className={currentStatus === 'finished' ? "border-green-500/50 bg-green-500/10 text-green-500" : "border-red-500/50 bg-red-500/10 text-red-500"}>
                    {currentStatus === 'finished' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertDescription>Esta OS está {currentStatus === 'finished' ? 'finalizada' : 'cancelada'}.</AlertDescription>
                </Alert>
            )}

            {/* ====== SEÇÃO 2: ACTION BAR ====== */}
            <div className="flex flex-col md:flex-row gap-3">

                {/* Primary Action Button (Takes flex-1) */}
                <div className="flex-1">
                    {/* OPEN */}
                    {currentStatus === 'open' && (
                        <Button
                            onClick={() => handleStatusChange('analyzing')}
                            disabled={isPending}
                            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                        >
                            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
                            Iniciar Análise
                        </Button>
                    )}

                    {/* ANALYZING */}
                    {currentStatus === 'analyzing' && (
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => setIsBudgetOpen(true)}
                                disabled={isPending}
                                className="col-span-2 h-12 bg-green-600 hover:bg-green-700 text-base font-semibold"
                            >
                                <FileText className="mr-2 h-5 w-5" />
                                Finalizar Diagnóstico
                            </Button>
                        </div>
                    )}

                    {/* WAITING_PARTS */}
                    {currentStatus === 'waiting_parts' && (
                        <Button
                            onClick={handleConfirmPartArrival}
                            disabled={isPending}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
                        >
                            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PackageCheck className="mr-2 h-5 w-5" />}
                            Confirmar Chegada das Peças
                        </Button>
                    )}

                    {/* IN_PROGRESS / READY */}
                    {(currentStatus === 'in_progress' || currentStatus === 'ready') && (
                        <Button
                            onClick={() => setIsFinishOpen(true)}
                            disabled={isPending}
                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-base font-semibold"
                        >
                            <Receipt className="mr-2 h-5 w-5" />
                            {currentStatus === 'in_progress' ? 'Finalizar Serviço' : 'Entregar ao Cliente'}
                        </Button>
                    )}

                    {/* FINISHED */}
                    {currentStatus === 'finished' && (
                        <Button
                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-base font-semibold"
                            onClick={() => {
                                const phone = orderData?.customerPhone?.replace(/\D/g, '') || ''
                                if (!phone) return alert('Cliente sem telefone.')

                                const baseUrl = window.location.origin
                                // Agora usamos o displayId na URL de feedback também!
                                const feedbackLink = `${baseUrl}/feedback/${displayId}`
                                const firstName = customerName.split(' ')[0]

                                const message = `Olá ${firstName}! 👋

Sua OS #${displayId} foi finalizada. Poderia nos avaliar?

🔗 ${feedbackLink}

Atenciosamente,
WTECH`

                                const url = `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`
                                window.open(url, '_blank')
                            }}
                        >
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Pedir Avaliação
                        </Button>
                    )}
                </div>

                {/* Secondary Actions Group (Share, PDF, More) */}
                <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
                    {/* Share Button (Always Visible) */}
                    <ShareActions
                        orderId={orderId}
                        displayId={displayId}
                        customerName={customerName}
                        storeName={storeSettings?.trade_name}
                        className="flex-1 sm:flex-none h-12 sm:w-12 p-0 flex items-center justify-center rounded-lg transition-colors shrink-0"
                        icon={<Share2 className="h-5 w-5" />}
                        variant="outline"
                    />

                    {/* PDF Button (Visible if finished/ready) */}
                    {(currentStatus === 'finished' || currentStatus === 'ready') && (
                        <PdfButtonWrapper
                            orderData={orderData!}
                            storeSettings={storeSettings!}
                            className="flex-1 sm:flex-none h-12 sm:w-12 p-0 flex items-center justify-center rounded-lg transition-colors shrink-0"
                            variant="outline"
                            icon={<FileDown className="h-5 w-5" />}
                        />
                    )}

                    {/* Dropdown Menu for Less Common Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none h-12 sm:w-12 p-0 rounded-lg shrink-0"
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuLabel>Ações da OS</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />

                            {/* Checkin Action - Always useful */}
                            <DropdownMenuItem asChild>
                                <Link href={`/os/${displayId}/checkin`} className="cursor-pointer flex items-center">
                                    <Package className="mr-2 h-4 w-4" />
                                    Ver Check-in / Retirada
                                </Link>
                            </DropdownMenuItem>

                            {/* Conditional Reopen */}
                            {(currentStatus === 'finished' || currentStatus === 'canceled') && (
                                <DropdownMenuItem onClick={handleReopen} className="cursor-pointer">
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Reabrir Ordem
                                </DropdownMenuItem>
                            )}

                            {/* Cancel (if active) */}
                            {['open', 'analyzing', 'waiting_approval', 'waiting_parts', 'in_progress'].includes(currentStatus) && (
                                <DropdownMenuItem
                                    onClick={() => handleStatusChange('canceled')}
                                    className="text-red-400 focus:text-red-400 focus:bg-red-950/50 cursor-pointer"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar OS
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-slate-800" />

                            {/* Delete (Destructive) */}
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-red-500 focus:text-red-500 focus:bg-red-950/50 cursor-pointer"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir Permanentemente
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
        </div>
    )
}

