'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import type { TechnicalReport } from '@/types/technical-report'

// Server Action
import { saveBudget } from '../actions'
import { generateBudget } from '@/app/actions/generate-budget'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

// Icons
import {
    Plus,
    Trash2,
    Loader2,
    ExternalLink,
    CheckCircle,
    AlertCircle,
    Copy,
    MessageCircle,
    X,
    Wand2,
} from 'lucide-react'

// ==================================================
// Zod Schema
// ==================================================
const budgetSchema = z.object({
    technicalReport: z.string().min(20, 'Laudo deve ter pelo menos 20 caracteres'),
    laborCost: z.number().min(0, 'Valor inválido'),
    externalParts: z.array(
        z.object({
            name: z.string().min(2, 'Nome da peça obrigatório'),
            purchaseUrl: z.string().url('URL inválida').or(z.literal('')),
        })
    ),
})

type BudgetFormData = z.infer<typeof budgetSchema>

// ==================================================
// Props
// ==================================================
interface BudgetModalProps {
    orderId: string
    displayId: number | string
    open: boolean
    onOpenChange: (open: boolean) => void
    technicalReport?: TechnicalReport | null
    equipmentContext?: string
    problemDescription?: string // New prop
}

// ==================================================
// Component
// ==================================================
export default function BudgetModal({ orderId, displayId, open, onOpenChange, technicalReport, equipmentContext, problemDescription }: BudgetModalProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [publicLink, setPublicLink] = useState('')
    const [copied, setCopied] = useState(false)

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<BudgetFormData>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            technicalReport: '',
            laborCost: 0,
            externalParts: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'externalParts',
    })

    // Pre-fill technical report if available and field is empty
    useEffect(() => {
        if (open && technicalReport) {
            const currentVal = watch('technicalReport')
            if (!currentVal) {
                const formattedReport = `ANÁLISE TÉCNICA:\n${technicalReport.technical_analysis}\n\nCONCLUSÃO:\n${technicalReport.conclusion}`
                setValue('technicalReport', formattedReport)
            }
        }
    }, [open, technicalReport, setValue, watch])

    const laborCost = watch('laborCost') || 0

    async function onSubmit(data: BudgetFormData) {
        setIsSubmitting(true)
        setFeedback(null)

        try {
            const result = await saveBudget(
                orderId,
                data.technicalReport,
                data.laborCost,
                data.externalParts.map(part => ({
                    name: part.name,
                    purchaseUrl: part.purchaseUrl,
                }))
            )

            if (result.success) {
                // Gerar link público com ID curto
                const link = `${window.location.origin}/os/${displayId}`
                setPublicLink(link)
                setShowSuccess(true)
                reset()
                router.refresh()
            } else {
                setFeedback({ type: 'error', message: result.message })
            }
        } catch (error) {
            console.error('Erro ao enviar orçamento:', error)
            setFeedback({
                type: 'error',
                message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleGenerateBudget() {
        const currentReport = watch('technicalReport')
        // Use current report if meaningful, otherwise use customer's problem description
        const textToAnalyze = (currentReport && currentReport.length > 20) ? currentReport : problemDescription

        if (!textToAnalyze || textToAnalyze.length < 10) {
            setFeedback({ type: 'error', message: 'Nenhuma descrição (Relato do Cliente ou Laudo) disponível para análise.' })
            return
        }

        setIsGeneratingAI(true)
        setFeedback(null)

        try {
            const result = await generateBudget(textToAnalyze, equipmentContext)

            if (result.success && result.data) {
                // Atualiza os campos com a sugestão da IA
                setValue('technicalReport', result.data.commercial_description) // Ou manter o original + sugestão? O usuario pediu "sobreescrever de forma refinada".
                setValue('laborCost', result.data.suggested_price)

                setFeedback({
                    type: 'success',
                    message: `Orçamento gerado pela IA (Nível VDI)! Justificativa: ${result.data.difficulty_reasoning}`
                })
            } else {
                setFeedback({ type: 'error', message: result.error || 'Erro ao gerar orçamento com IA.' })
            }
        } catch (error) {
            console.error(error)
            setFeedback({ type: 'error', message: 'Falha na comunicação com a IA.' })
        } finally {
            setIsGeneratingAI(false)
        }
    }

    function handleCopyLink() {
        navigator.clipboard.writeText(publicLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function handleWhatsApp() {
        const message = encodeURIComponent(`Olá! Segue o orçamento do seu equipamento: ${publicLink}`)
        window.open(`https://wa.me/?text=${message}`, '_blank')
    }

    function handleClose() {
        setShowSuccess(false)
        setPublicLink('')
        setCopied(false)
        onOpenChange(false)
    }

    function formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value)
    }

    return (
        <Dialog open={open} onOpenChange={showSuccess ? handleClose : onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* ============================================ */}
                {/* TELA DE SUCESSO */}
                {/* ============================================ */}
                {showSuccess ? (
                    <div className="py-6 text-center space-y-6">
                        {/* Ícone de Sucesso */}
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Título */}
                        <div>
                            <h2 className="text-2xl font-bold text-green-600">Orçamento Enviado!</h2>
                            <p className="text-muted-foreground mt-2">
                                Compartilhe o link abaixo com o cliente para ele visualizar e aprovar.
                            </p>
                        </div>

                        {/* Link Público */}
                        <div className="space-y-2">
                            <Label>Link do Orçamento</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={publicLink}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyLink}
                                    className={copied ? 'text-green-600' : ''}
                                >
                                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            {copied && (
                                <p className="text-sm text-green-600">✓ Link copiado!</p>
                            )}
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCopyLink}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar Link
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={handleWhatsApp}
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Enviar no WhatsApp
                            </Button>
                        </div>

                        {/* Botão Fechar */}
                        <Button variant="ghost" onClick={handleClose} className="mt-4">
                            <X className="mr-2 h-4 w-4" />
                            Fechar
                        </Button>
                    </div>
                ) : (
                    /* ============================================ */
                    /* FORMULÁRIO DE ORÇAMENTO */
                    /* ============================================ */
                    <>
                        <DialogHeader>
                            <DialogTitle>Orçamento Técnico</DialogTitle>
                            <DialogDescription>
                                Informe o diagnóstico, valor da mão de obra e indique onde o cliente pode comprar as peças.
                            </DialogDescription>
                        </DialogHeader>

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

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Laudo Técnico */}
                            <div className="space-y-2">
                                <Label htmlFor="technicalReport">Laudo Técnico *</Label>
                                <Textarea
                                    id="technicalReport"
                                    placeholder="Descreva detalhadamente o problema encontrado, a causa raiz e a solução proposta..."
                                    rows={5}
                                    {...register('technicalReport')}
                                    disabled={isSubmitting}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerateBudget}
                                        disabled={isGeneratingAI || isSubmitting}
                                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                    >
                                        {isGeneratingAI ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Wand2 className="mr-2 h-4 w-4" />
                                        )}
                                        {isGeneratingAI ? 'Refinando...' : 'Refinar e Precificar com IA'}
                                    </Button>
                                </div>
                                {errors.technicalReport && (
                                    <p className="text-sm text-destructive">{errors.technicalReport.message}</p>
                                )}
                            </div>

                            {/* Mão de Obra */}
                            <div className="space-y-2">
                                <Label htmlFor="laborCost">Valor da Mão de Obra (R$) *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        R$
                                    </span>
                                    <Input
                                        id="laborCost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        className="pl-10"
                                        {...register('laborCost', { valueAsNumber: true })}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.laborCost && (
                                    <p className="text-sm text-destructive">{errors.laborCost.message}</p>
                                )}
                            </div>

                            {/* Peças Externas */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Peças Externas (Compra Assistida)</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ name: '', purchaseUrl: '' })}
                                        disabled={isSubmitting}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Adicionar Peça
                                    </Button>
                                </div>

                                {fields.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                                        Nenhuma peça adicionada. Clique em "Adicionar Peça" se necessário.
                                    </p>
                                )}

                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="grid gap-3 p-4 border rounded-lg bg-muted/30"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Peça #{index + 1}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                disabled={isSubmitting}
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label htmlFor={`part-name-${index}`}>Nome da Peça</Label>
                                                <Input
                                                    id={`part-name-${index}`}
                                                    placeholder="Ex: Bateria para Dell Inspiron"
                                                    {...register(`externalParts.${index}.name`)}
                                                    disabled={isSubmitting}
                                                />
                                                {errors.externalParts?.[index]?.name && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.externalParts[index]?.name?.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor={`part-url-${index}`}>Link de Compra</Label>
                                                <div className="relative">
                                                    <Input
                                                        id={`part-url-${index}`}
                                                        type="url"
                                                        placeholder="https://mercadolivre.com.br/..."
                                                        className="pr-10"
                                                        {...register(`externalParts.${index}.purchaseUrl`)}
                                                        disabled={isSubmitting}
                                                    />
                                                    <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                </div>
                                                {errors.externalParts?.[index]?.purchaseUrl && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.externalParts[index]?.purchaseUrl?.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Resumo / Total */}
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between text-lg font-semibold">
                                    <span>Total (Mão de Obra):</span>
                                    <span className="text-primary">{formatCurrency(laborCost)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    * O valor das peças será pago diretamente pelo cliente nos links indicados.
                                </p>
                            </div>

                            {/* Footer */}
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        'Enviar Orçamento'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
