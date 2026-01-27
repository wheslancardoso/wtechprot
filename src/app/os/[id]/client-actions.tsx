'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Server Actions
import { approveBudget, rejectBudget } from './actions'

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
} from 'lucide-react'

import { cn } from '@/lib/utils'
import TermsAgreementStep from '@/components/approval/terms-agreement-step'

interface ClientActionsProps {
    orderId: string
    hasParts: boolean
    status: string
    customerName: string
}

type WizardStep = 'TERMS' | 'SIGN' | 'PROCESSING' | 'SUCCESS'

export default function ClientActions({ orderId, hasParts, status, customerName }: ClientActionsProps) {
    const router = useRouter()

    // Estados do Modal
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState<WizardStep>('TERMS')

    // Dados do Formulário
    const [isRejecting, setIsRejecting] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [acceptedTermsSnapshot, setAcceptedTermsSnapshot] = useState<any[]>([])
    const [signedName, setSignedName] = useState('')
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Status do Pedido
    const alreadyApproved = ['waiting_parts', 'in_progress', 'ready', 'finished'].includes(status)
    const isCanceled = status === 'canceled'
    const canTakeAction = status === 'waiting_approval'

    // Lógica de Validação de Assinatura
    const isNameValid = () => {
        if (!signedName || signedName.length < 3) return false

        const input = signedName.toLowerCase().trim()
        const target = customerName.toLowerCase().trim()
        const inputParts = input.split(' ')
        const targetParts = target.split(' ')

        if (inputParts[0] === targetParts[0]) return true
        return target.includes(input)
    }

    async function handleFinalApprove() {
        if (!isNameValid()) {
            setResult({ type: 'error', message: 'Assinatura incorreta. Digite seu nome conforme cadastro.' })
            return
        }

        setStep('PROCESSING')
        setResult(null)

        try {
            const signatureData = {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                acceptedTerms: acceptedTerms,
                acceptedTermsSnapshot: acceptedTermsSnapshot,
                hasParts: hasParts,
                signedName: signedName,
            }

            const response = await approveBudget(orderId, signatureData)

            if (response.success) {
                setResult({ type: 'success', message: response.message })
                setStep('SUCCESS')

                // Fechar modal e redirect após sucesso
                setTimeout(() => {
                    setIsOpen(false)
                    router.push(`/os/${orderId}/track`)
                }, 3000)
            } else {
                setResult({ type: 'error', message: response.message })
                setStep('SIGN')
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
            })
            setStep('SIGN')
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

    // 1. Já Aprovado (Banner Fixo)
    if (alreadyApproved) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-green-50 dark:bg-green-950 border-t border-green-200 dark:border-green-800 p-4 safe-area-bottom z-50">
                <div className="container mx-auto max-w-lg">
                    <Alert variant="success" className="border-green-300">
                        <PartyPopper className="h-5 w-5" />
                        <AlertDescription className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-green-900 dark:text-green-100">Orçamento Aprovado!</span>
                            </div>
                            {status === 'waiting_parts' && <span className="text-sm">Aguardando entrega de peças.</span>}
                            {status === 'in_progress' && <span className="text-sm">Reparo em andamento.</span>}

                            <Button size="sm" variant="outline" className="mt-2 w-full bg-white/50" onClick={() => router.push(`/os/${orderId}/track`)}>
                                Acompanhar Serviço
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    // 2. Cancelado
    if (isCanceled) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-red-50 dark:bg-red-950 border-t border-red-200 dark:border-red-800 p-4 safe-area-bottom z-50">
                <div className="container mx-auto max-w-lg">
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
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-bottom z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto max-w-lg">
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

            {/* MODAL DE APROVAÇÃO (WIZARD) */}
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Aprovação Digital
                        </DialogTitle>
                        <DialogDescription>
                            {step === 'TERMS' && 'Por favor, revise e aceite os termos para continuar.'}
                            {step === 'SIGN' && 'Confirme sua identidade para assinar o contrato.'}
                            {step === 'SUCCESS' && 'Tudo pronto!'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* CONTEÚDO DINÂMICO DO MODAL */}
                    <div className="py-2">
                        {/* PASSO 1: TERMOS */}
                        {step === 'TERMS' && (
                            <TermsAgreementStep
                                hasParts={hasParts}
                                entryChecklist={{}}
                                variant="inline" // Usando inline visual (compacto)
                                onChange={(isValid, snapshot) => {
                                    setAcceptedTerms(isValid)
                                    setAcceptedTermsSnapshot(snapshot)
                                }}
                                onComplete={() => { }} // Não usado
                            />
                        )}

                        {/* PASSO 2: ASSINATURA */}
                        {step === 'SIGN' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4">
                                <Alert className="bg-muted">
                                    <FileText className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        Ao assinar, você concorda com todos os termos revisados anteriormente.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <Label htmlFor="signature" className="text-sm font-medium">
                                        Digite seu NOME COMPLETO para assinar:
                                    </Label>
                                    <Input
                                        id="signature"
                                        value={signedName}
                                        onChange={(e) => setSignedName(e.target.value)}
                                        placeholder={`Ex: ${customerName}`}
                                        className={cn(
                                            "h-12 text-lg font-medium",
                                            !isNameValid() && signedName.length > 3 ? "border-destructive focus-visible:ring-destructive" : "border-primary focus-visible:ring-primary"
                                        )}
                                        autoComplete="off"
                                    />
                                    {!isNameValid() && signedName.length > 2 && (
                                        <p className="text-xs text-destructive">
                                            Digite o nome igual ao cadastro: <strong>{customerName}</strong>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PROCESSING & SUCCESS */}
                        {(step === 'PROCESSING' || step === 'SUCCESS') && (
                            <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
                                {step === 'PROCESSING' ? (
                                    <>
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Gerando contrato digital...</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-in zoom-in">
                                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-green-700">Aprovado!</h3>
                                            <p className="text-sm text-muted-foreground mt-2">Redirecionando...</p>
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

                    {/* ACTIONS FOOTER */}
                    {['TERMS', 'SIGN'].includes(step) && (
                        <DialogFooter className="gap-2 sm:gap-0">
                            {step === 'TERMS' ? (
                                <Button
                                    className="w-full"
                                    onClick={() => setStep('SIGN')}
                                    disabled={!acceptedTerms}
                                >
                                    Concordar e Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <div className="flex gap-2 w-full">
                                    <Button variant="outline" className="flex-1" onClick={() => setStep('TERMS')}>
                                        Voltar
                                    </Button>
                                    <Button
                                        className="flex-[2] bg-green-600 hover:bg-green-700"
                                        onClick={handleFinalApprove}
                                        disabled={!isNameValid()}
                                    >
                                        <PenTool className="mr-2 h-4 w-4" />
                                        Assinar Contrato
                                    </Button>
                                </div>
                            )}
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
