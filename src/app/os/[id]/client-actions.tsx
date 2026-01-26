'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Server Actions
import { approveBudget, rejectBudget } from './actions'

// UI Components
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'

// Icons
import {
    CheckCircle,
    XCircle,
    Loader2,
    PartyPopper,
    Clock,
    Wrench,
    AlertTriangle,
} from 'lucide-react'

interface ClientActionsProps {
    orderId: string
    hasParts: boolean
    status: string
}

export default function ClientActions({ orderId, hasParts, status }: ClientActionsProps) {
    const router = useRouter()
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Status que indicam que já foi aprovado/processado
    const alreadyApproved = ['waiting_parts', 'in_progress', 'ready', 'finished'].includes(status)
    const isCanceled = status === 'canceled'
    const canTakeAction = status === 'waiting_approval'

    async function handleApprove() {
        // Validar checkbox se tem peças
        if (hasParts && !acceptedTerms) {
            setResult({
                type: 'error',
                message: 'Você precisa aceitar os termos para continuar.'
            })
            return
        }

        setIsApproving(true)
        setResult(null)

        try {
            // Capturar dados de assinatura
            const signatureData = {
                ip: 'captured-by-server', // Será capturado no backend
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                acceptedTerms: acceptedTerms,
                hasParts: hasParts,
            }

            const response = await approveBudget(orderId, signatureData)

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
            setIsApproving(false)
        }
    }

    async function handleReject() {
        const confirmed = window.confirm(
            'Tem certeza que deseja reprovar o orçamento?\n\nEssa ação cancelará a ordem de serviço.'
        )

        if (!confirmed) return

        setIsRejecting(true)
        setResult(null)

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

    // ============================================
    // TELA: Já foi aprovado
    // ============================================
    if (alreadyApproved) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-green-50 dark:bg-green-950 border-t border-green-200 dark:border-green-800 p-4 safe-area-bottom">
                <div className="container mx-auto max-w-lg">
                    <Alert variant="success" className="border-green-300">
                        <PartyPopper className="h-5 w-5" />
                        <AlertTitle>Orçamento Aprovado!</AlertTitle>
                        <AlertDescription>
                            {status === 'waiting_parts' && (
                                <>
                                    <Clock className="inline mr-1 h-4 w-4" />
                                    Aguardando você entregar as peças na assistência.
                                </>
                            )}
                            {status === 'in_progress' && (
                                <>
                                    <Wrench className="inline mr-1 h-4 w-4" />
                                    Seu equipamento está sendo reparado.
                                </>
                            )}
                            {status === 'ready' && (
                                <>
                                    <CheckCircle className="inline mr-1 h-4 w-4" />
                                    Pronto! Entre em contato para retirada.
                                </>
                            )}
                            {status === 'finished' && (
                                <>
                                    <CheckCircle className="inline mr-1 h-4 w-4" />
                                    Serviço concluído. Obrigado pela preferência!
                                </>
                            )}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    // ============================================
    // TELA: Foi cancelado
    // ============================================
    if (isCanceled) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-red-50 dark:bg-red-950 border-t border-red-200 dark:border-red-800 p-4 safe-area-bottom">
                <div className="container mx-auto max-w-lg">
                    <Alert variant="destructive">
                        <XCircle className="h-5 w-5" />
                        <AlertTitle>Serviço Cancelado</AlertTitle>
                        <AlertDescription>
                            Esta ordem de serviço foi cancelada.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    // ============================================
    // TELA: Pode aprovar/reprovar
    // ============================================
    if (canTakeAction) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-bottom">
                <div className="container mx-auto max-w-lg space-y-4">
                    {/* Feedback */}
                    {result && (
                        <Alert variant={result.type === 'success' ? 'success' : 'destructive'}>
                            {result.type === 'success' ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <XCircle className="h-4 w-4" />
                            )}
                            <AlertDescription>{result.message}</AlertDescription>
                        </Alert>
                    )}

                    {/* CHECKBOX OBRIGATÓRIO - Termos de Compra Assistida */}
                    {hasParts && (
                        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                                    Termo de Responsabilidade - Compra Assistida
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="accept-terms"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label
                                    htmlFor="accept-terms"
                                    className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                                >
                                    Declaro que sou responsável pela compra da(s) peça(s) no(s) link(s) indicado(s)
                                    e compreendo que a <strong>garantia do componente é tratada diretamente com o
                                        vendedor externo</strong>, isentando a WTECH de garantia sobre a peça,
                                    conforme art. 18 do Código de Defesa do Consumidor. A WTECH oferece garantia
                                    de <strong>90 dias apenas sobre a mão de obra</strong> do serviço prestado.
                                </Label>
                            </div>
                        </div>
                    )}

                    {/* Botões */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={handleReject}
                            disabled={isApproving || isRejecting}
                        >
                            {isRejecting ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <XCircle className="mr-2 h-5 w-5" />
                            )}
                            Reprovar
                        </Button>
                        <Button
                            className="flex-1 h-12 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting || (hasParts && !acceptedTerms)}
                        >
                            {isApproving ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle className="mr-2 h-5 w-5" />
                            )}
                            Aprovar Orçamento
                        </Button>
                    </div>

                    {/* Dica se não aceitou termos */}
                    {hasParts && !acceptedTerms && (
                        <p className="text-xs text-center text-muted-foreground">
                            ☝️ Marque o checkbox acima para habilitar a aprovação
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return null
}
