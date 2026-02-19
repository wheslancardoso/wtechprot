'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Server Actions
import { approveBudget, rejectBudget } from './actions'
import { confirmPartArrival } from './actions'

// UI Components
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// Icons
import {
    CheckCircle,
    XCircle,
    Loader2,
    PartyPopper,
    Clock,
    Wrench,
    AlertTriangle,
    PenTool,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    FileText,
    PackageCheck, // New Icon
} from 'lucide-react'

import { cn } from '@/lib/utils'
import TermsAgreementStep from '@/components/approval/terms-agreement-step'

interface ClientActionsProps {
    orderId: string
    displayId?: string
    hasParts: boolean
    status: string
    customerName: string
    techPhone?: string
}

type WizardStep = 'TERMS' | 'PROCESSING' | 'SUCCESS'

export default function ClientActions({ orderId, displayId, hasParts, status, customerName, techPhone }: ClientActionsProps) {
    const router = useRouter()

    // Use displayId if available for prettier URLs, otherwise fallback to orderId
    const trackingId = displayId || orderId

    // Estados do Modal
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState<WizardStep>('TERMS')
    const [isConfirmingArrival, setIsConfirmingArrival] = useState(false) // New State

    // Dados do Formulário
    const [isRejecting, setIsRejecting] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [acceptedTermsSnapshot, setAcceptedTermsSnapshot] = useState<any[]>([])
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Status do Pedido
    const alreadyApproved = ['in_progress', 'ready', 'finished'].includes(status)
    // REMOVED 'waiting_parts' from alreadyApproved group to handle it separately
    const isWaitingParts = status === 'waiting_parts'
    const isCanceled = status === 'canceled'

    async function handlePartArrival() {
        setIsConfirmingArrival(true)
        try {
            const result = await confirmPartArrival(orderId)

            if (result.success) {
                // Atualizar a página primeiro (remove o banner de peças)
                router.refresh()

                // Abrir WhatsApp em nova aba
                if (techPhone) {
                    const message = encodeURIComponent(`Olá! Confirmo que as peças da OS #${trackingId} já chegaram no meu endereço. Podemos agendar a visita técnica para instalação?`)
                    const whatsappUrl = `https://api.whatsapp.com/send?phone=55${techPhone.replace(/\D/g, '')}&text=${message}`
                    window.open(whatsappUrl, '_blank')
                }
            } else {
                alert(result.message) // Fallback simples
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsConfirmingArrival(false)
        }
    }

    async function handleFinalApprove() {
        if (!acceptedTerms) {
            setResult({ type: 'error', message: 'Você precisa aceitar todos os termos para continuar.' })
            return
        }

        setStep('PROCESSING')
        setResult(null)

        try {
            // Captura metadados para Click-Agreement
            const signatureData = {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                acceptedTerms: acceptedTerms,
                acceptedTermsSnapshot: acceptedTermsSnapshot,
                hasParts: hasParts,
                signedName: "Click Agreement", // Placeholder não usado
            }

            const response = await approveBudget(orderId, signatureData)

            if (response.success) {
                setResult({ type: 'success', message: response.message })
                setStep('SUCCESS')

                // Fechar modal e redirect após sucesso
                setTimeout(() => {
                    setIsOpen(false)
                    // Se tiver peças, recarrega a página para mostrar o status "Aguardando Peças"
                    // Se não tiver, vai para a tela de rastreamento
                    if (hasParts) {
                        router.refresh()
                    } else {
                        router.push(`/os/${trackingId}/track`)
                    }
                }, 3000)
            } else {
                setResult({ type: 'error', message: response.message })
                setStep('TERMS')
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
            })
            setStep('TERMS')
        }
    }

    async function handleReject() {
        const confirmed = window.confirm(
            'Tem certeza que deseja reprovar o orçamento?\n\nEssa ação cancelará a ordem de serviço.'
        )

        if (!confirmed) return

        setIsRejecting(true)

        try {
            const response = await rejectBudget(orderId)

            if (response.success) {
                setResult({ type: 'success', message: response.message })
                router.refresh()
            } else {
                setResult({ type: 'error', message: response.message })
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
            })
        } finally {
            setIsRejecting(false)
        }
    }

    // Resetar wizard ao abrir
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open) {
            setStep('TERMS')
            setResult(null)
        }
    }

    // ============================================
    // RENDERS
    // ============================================

    // 1. Aguardando Peças (Ação do Cliente)
    if (isWaitingParts) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 dark:bg-yellow-950/30 border-t border-yellow-200 dark:border-yellow-800 p-4 safe-area-bottom z-50">
                <div className="container mx-auto max-w-lg md:max-w-5xl space-y-3">
                    <div className="flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
                        <PackageCheck className="h-6 w-6 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-sm">Estamos aguardando suas peças</h4>
                            <p className="text-xs opacity-90">Assim que chegarem, nos avise para instalar.</p>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-md"
                        onClick={handlePartArrival}
                        disabled={isConfirmingArrival}
                    >
                        {isConfirmingArrival ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <CheckCircle className="mr-2 h-5 w-5" />
                        )}
                        📦 Já recebi a peça - Agendar Visita
                    </Button>
                </div>
            </div>
        )
    }

    // 2. Já Aprovado (Banner Fixo) - Now excludes waiting_parts
    if (alreadyApproved) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 safe-area-bottom z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto max-w-lg md:max-w-5xl space-y-3">
                    <div className="flex items-center justify-between text-green-700 dark:text-green-400">
                        <div className="flex items-center gap-2">
                            {status === 'ready' || status === 'finished' ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : (
                                <Wrench className="h-5 w-5" />
                            )}
                            <span className="font-bold text-lg">
                                {status === 'in_progress' && 'Serviço em Andamento'}
                                {status === 'ready' && 'Pronto para Retirada!'}
                                {status === 'finished' && 'Serviço Finalizado!'}
                                {!['in_progress', 'ready', 'finished'].includes(status) && 'Orçamento Aprovado!'}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {status === 'in_progress' && 'Acompanhe a evolução do serviço:'}
                        {status === 'ready' && 'Seu aparelho já está pronto. Venha buscar em horário comercial.'}
                        {status === 'finished' && 'Serviço concluído. Que tal avaliar nossa loja?'}
                        {!['in_progress', 'ready', 'finished'].includes(status) && 'O técnico já recebeu sua confirmação.'}
                    </p>

                    {status === 'finished' ? (
                        <Button
                            size="lg"
                            className="w-full h-14 text-lg font-bold bg-yellow-500 hover:bg-yellow-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all animate-pulse-slow"
                            onClick={() => router.push(`/feedback/${orderId}`)}
                        >
                            <PartyPopper className="mr-2 h-5 w-5" />
                            AVALIAR SERVIÇO AGORA
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all animate-pulse-slow"
                            onClick={() => router.push(`/os/${trackingId}/track`)}
                        >
                            <Wrench className="mr-2 h-5 w-5" />
                            ACOMPANHAR EM TEMPO REAL
                        </Button>
                    )}
                </div>
            </div >
        )
    }

    // 3. Cancelado
    if (isCanceled) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-red-50 dark:bg-red-950 border-t border-red-200 dark:border-red-800 p-4 safe-area-bottom z-50">
                <div className="container mx-auto max-w-lg md:max-w-5xl">
                    <Alert variant="destructive">
                        <XCircle className="h-5 w-5" />
                        <AlertTitle>Serviço Cancelado</AlertTitle>
                        <AlertDescription>Esta ordem de serviço foi cancelada.</AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    // 3. Footer de Ação (Abre Dialog)
    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 pb-safe safe-area-bottom z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto max-w-lg md:max-w-5xl">
                    {/* Mensagem de erro global (se houver erro fora do modal) */}
                    {result && !isOpen && (
                        <Alert variant={result.type === 'success' ? 'success' : 'destructive'} className="mb-2">
                            <AlertDescription>{result.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-14 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                            onClick={handleReject}
                            disabled={isRejecting}
                        >
                            {isRejecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="mr-2 h-5 w-5" />}
                            Reprovar
                        </Button>

                        <Button
                            className="flex-[2] h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                            onClick={() => handleOpenChange(true)}
                        >
                            <FileText className="mr-2 h-5 w-5" />
                            Revisar e Aprovar
                        </Button>
                    </div>
                </div>
            </div>

            {/* MODAL DE APROVAÇÃO (CLICK-AGREEMENT) */}
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-h-[95vh] h-[95vh] sm:h-auto w-[95vw] sm:w-full sm:max-w-3xl p-0 gap-0 overflow-hidden flex flex-col rounded-xl">
                    <DialogHeader className="p-4 sm:p-6 border-b shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Aprovação Digital
                        </DialogTitle>
                        <DialogDescription>
                            {step === 'TERMS' && 'Revise os termos e confirme sua aprovação.'}
                            {step === 'SUCCESS' && 'Tudo pronto!'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* CONTEÚDO DINÂMICO DO MODAL */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {/* PASSO 1: TERMOS + CLICK SIGN */}
                        {step === 'TERMS' && (
                            <div className="space-y-6">
                                <TermsAgreementStep
                                    hasParts={hasParts}
                                    entryChecklist={{}}
                                    variant="inline"
                                    onChange={(isValid, snapshot) => {
                                        setAcceptedTerms(isValid)
                                        setAcceptedTermsSnapshot(snapshot)
                                    }}
                                    onComplete={() => { }}
                                />

                                <div className="space-y-4 pt-4 border-t">
                                    <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground flex gap-3">
                                        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                                        <p>
                                            Ao clicar em "Confirmar Aprovação", você aceita eletronicamente o orçamento e os termos acima.
                                            Seu IP, navegador e horário serão registrados como evidência de validade jurídica.
                                        </p>
                                    </div>

                                    <Button
                                        className="w-full h-auto py-4 text-base sm:text-lg font-bold bg-green-600 hover:bg-green-700 shadow-md whitespace-normal"
                                        onClick={handleFinalApprove}
                                        disabled={!acceptedTerms}
                                    >
                                        <CheckCircle className="mr-2 h-5 w-5 shrink-0" />
                                        <span className="text-center">CONFIRMAR APROVAÇÃO E ACEITAR TERMOS</span>
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        Esta ação é definitiva e inicia o processo de reparo.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* PROCESSING & SUCCESS */}
                        {(step === 'PROCESSING' || step === 'SUCCESS') && (
                            <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
                                {step === 'PROCESSING' ? (
                                    <>
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Registrando assinatura eletrônica...</p>
                                        <p className="text-xs text-muted-foreground">Capturando metadados de segurança...</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-in zoom-in">
                                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-green-700">Aprovado com Sucesso!</h3>
                                            <p className="text-sm text-muted-foreground mt-2">Redirecionando para rastreamento...</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* MENSAGEM DE ERRO DENTRO DO MODAL */}
                        {result && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{result.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
