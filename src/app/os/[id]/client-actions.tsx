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
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

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
} from 'lucide-react'

interface ClientActionsProps {
    orderId: string
    hasParts: boolean
    status: string
    customerName: string
}

type WizardStep = 'START' | 'TERMS' | 'SIGN' | 'PROCESSING' | 'SUCCESS'

export default function ClientActions({ orderId, hasParts, status, customerName }: ClientActionsProps) {
    const router = useRouter()

    // Estados do Wizard
    const [step, setStep] = useState<WizardStep>('START')

    // Dados do Formulário
    const [isRejecting, setIsRejecting] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [signedName, setSignedName] = useState('')
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Status do Pedido
    const alreadyApproved = ['waiting_parts', 'in_progress', 'ready', 'finished'].includes(status)
    const isCanceled = status === 'canceled'
    const canTakeAction = status === 'waiting_approval'

    // Lógica de Validação de Assinatura
    const isNameValid = () => {
        if (!signedName || signedName.length < 3) return false

        // Normalizar strings para comparação
        const input = signedName.toLowerCase().trim()
        const target = customerName.toLowerCase().trim()

        // Verifica se pelo menos o primeiro nome bate ou se contém partes
        // Isso evita bloqueio por abreviações ou erros pequenos
        const inputParts = input.split(' ')
        const targetParts = target.split(' ')

        // Se digitou pelo menos o primeiro nome correto
        if (inputParts[0] === targetParts[0]) return true

        // Se o nome digitado está contido no nome completo (ex: "Silva" em "João da Silva") - pode ser arriscado, mas flexível
        // Melhor: Se o input conter pelo menos 2 partes do nome original (se houver)

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
            // Capturar dados de assinatura
            const signatureData = {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                acceptedTerms: hasParts ? acceptedTerms : true, // Se não tem peças, termos ok implícito
                hasParts: hasParts,
                signedName: signedName,
            }

            const response = await approveBudget(orderId, signatureData)

            if (response.success) {
                setResult({ type: 'success', message: response.message })
                setStep('SUCCESS')

                // Redirecionar para rastreamento após delay
                setTimeout(() => {
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

    // Navegação do Wizard
    const nextStep = () => {
        if (step === 'START') {
            if (hasParts) setStep('TERMS')
            else setStep('SIGN')
        } else if (step === 'TERMS') {
            if (acceptedTerms) setStep('SIGN')
        }
    }

    const prevStep = () => {
        if (step === 'TERMS') setStep('START')
        if (step === 'SIGN') {
            if (hasParts) setStep('TERMS')
            else setStep('START')
        }
    }

    // ============================================
    // RENDERS
    // ============================================

    // 1. Já Aprovado
    if (alreadyApproved) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-green-50 dark:bg-green-950 border-t border-green-200 dark:border-green-800 p-4 safe-area-bottom z-50">
                <div className="container mx-auto max-w-lg">
                    <Alert variant="success" className="border-green-300">
                        <PartyPopper className="h-5 w-5" />
                        <AlertDescription className="flex flex-col gap-2">
                            <span className="font-semibold text-green-900 dark:text-green-100">Orçamento Aprovado!</span>

                            {status === 'waiting_parts' && (
                                <span className="text-sm">Aguardando entrega de peças.</span>
                            )}
                            {status === 'in_progress' && (
                                <span className="text-sm">Reparo em andamento.</span>
                            )}

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

    // 3. Wizard Ativo (Overlay)
    if (['TERMS', 'SIGN', 'PROCESSING', 'SUCCESS'].includes(step)) {
        return (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
                <Card className="w-full max-w-md shadow-2xl border-primary/20">

                    {/* Header do Wizard */}
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Aprovação Digital
                        </CardTitle>
                        <CardDescription>
                            {step === 'TERMS' && 'Passo 1 de 2: Termos de Serviço'}
                            {step === 'SIGN' && 'Passo 2 de 2: Assinatura Eletrônica'}
                            {step === 'PROCESSING' && 'Processando...'}
                            {step === 'SUCCESS' && 'Sucesso!'}
                        </CardDescription>
                    </CardHeader>

                    {/* Conteúdo dinâmico */}
                    <CardContent className="space-y-4">

                        {/* PASSO 1: TERMOS */}
                        {step === 'TERMS' && (
                            <div className="space-y-4 animate-in slide-in-from-right-4">
                                <Alert variant="warning" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Compra Assistida</AlertTitle>
                                    <AlertDescription className="text-xs mt-1">
                                        Como este serviço exige peças compradas por fora, precisamos do seu de acordo.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                                        Declaro que compreendo que a garantia das peças é responsabilidade do vendedor externo.
                                        A assistência oferece garantia de 90 dias apenas sobre a mão de obra.
                                    </Label>
                                </div>
                            </div>
                        )}

                        {/* PASSO 2: ASSINATURA */}
                        {step === 'SIGN' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4">
                                <div className="bg-muted/30 p-4 rounded-lg border text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">Eu, abaixo assinado,</p>
                                    <p className="font-bold text-lg text-primary">{customerName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        confirmo a aprovação deste orçamento em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="signature" className="text-sm font-medium">
                                        Para assinar, digite seu NOME COMPLETO abaixo:
                                    </Label>
                                    <Input
                                        id="signature"
                                        value={signedName}
                                        onChange={(e) => setSignedName(e.target.value)}
                                        placeholder={`Ex: ${customerName.split(' ')[0]}...`}
                                        className={`h-12 text-lg ${!isNameValid() && signedName.length > 3 ? 'border-destructive/50' : 'border-primary/50'}`}
                                        autoComplete="off"
                                    />
                                    {!isNameValid() && signedName.length > 2 && (
                                        <p className="text-xs text-destructive animate-pulse">
                                            Digite o nome exatamente como mostrado acima para confirmar.
                                        </p>
                                    )}
                                </div>

                                <p className="text-[10px] text-center text-muted-foreground/60">
                                    Ao finalizar, registraremos seu IP e dispositivo como prova legal de aceite (Lei 14.063/2020).
                                </p>
                            </div>
                        )}

                        {/* LOADING */}
                        {step === 'PROCESSING' && (
                            <div className="py-8 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Registrando assinatura e gerando contrato...</p>
                            </div>
                        )}

                        {/* SUCESSO */}
                        {step === 'SUCCESS' && (
                            <div className="py-6 flex flex-col items-center justify-center gap-4 text-center animate-in zoom-in duration-300">
                                <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-green-700">Aprovado com Sucesso!</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Você será redirecionado para o acompanhamento em instantes.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Mensagens de Erro Globais */}
                        {result?.type === 'error' && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{result.message}</AlertDescription>
                            </Alert>
                        )}

                    </CardContent>

                    {/* Footer de Navegação */}
                    {['TERMS', 'SIGN'].includes(step) && (
                        <CardFooter className="flex justify-between gap-3 bg-muted/10 pt-6">
                            <Button variant="ghost" onClick={prevStep}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                            </Button>

                            {step === 'TERMS' && (
                                <Button onClick={nextStep} disabled={!acceptedTerms}>
                                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}

                            {step === 'SIGN' && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                                    onClick={handleFinalApprove}
                                    disabled={!isNameValid()}
                                >
                                    <PenTool className="mr-2 h-4 w-4" />
                                    Assinar e Finalizar
                                </Button>
                            )}
                        </CardFooter>
                    )}
                </Card>
            </div>
        )
    }

    // 4. Estado Inicial (Botões Flutuantes)
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-bottom z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
            <div className="container mx-auto max-w-lg space-y-4">
                {/* Feedback Rápido fora do Wizard */}
                {result && (
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
                        className="flex-[2] h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        onClick={nextStep} // Inicia o Wizard
                    >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Aprovar Orçamento
                    </Button>
                </div>
            </div>
        </div>
    )
}
