'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import type { TechnicalReport } from '@/types/technical-report'
import type { PartsSourcingMode } from '@/types/database'

// Server Action
import { saveBudget } from '../actions'
import { generateBudget } from '@/actions/generate-budget'
import { validateCoupon, getAvailableCouponForOrder } from '@/actions/nps-actions'

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
    ShoppingCart,
    Briefcase,
    Link2,
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
            price: z.number().min(0, 'Valor inválido').optional(),
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
    const [sourcingMode, setSourcingMode] = useState<PartsSourcingMode>('assisted')

    // Coupon State
    const [couponCode, setCouponCode] = useState('')
    const [discountAmount, setDiscountAmount] = useState(0)
    const [couponError, setCouponError] = useState('')
    const [couponSuccess, setCouponSuccess] = useState(false)

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

    // Auto-check for coupons on mount
    useEffect(() => {
        let mounted = true
        async function checkCoupon() {
            if (!orderId || !open) return
            // If already has code, don't overwrite
            if (couponCode) return

            const code = await getAvailableCouponForOrder(orderId)
            if (code && mounted) {
                setCouponCode(code)
                // If labor cost is already defined, try to validate immediately
                const currentLabor = watch('laborCost')
                if (currentLabor && currentLabor > 0) {
                    const result = await validateCoupon(code, currentLabor)
                    if (result.success && mounted) {
                        setDiscountAmount(result.discountAmount)
                        setCouponSuccess(true)
                    }
                }
            }
        }
        checkCoupon()
        return () => { mounted = false }
    }, [open, orderId]) // Run once when opened

    // Auto-apply if coupon filled but labor changed? 
    // Maybe too aggressive. Let's stick to "on load" for now as requested "já fica aplicado".
    // If user changes labor, they might need to re-click Apply or we add usage in `laborCost` watcher.
    // Ideally, if `couponSuccess` is true, we should update discount when labor changes.
    useEffect(() => {
        if (couponSuccess && couponCode && laborCost > 0) {
            // Simple recalc without server trip if we trust the percentage, 
            // but validating again is safer.
            // Debouncing would be good, but for now let's just use the server action
            const timeout = setTimeout(async () => {
                const result = await validateCoupon(couponCode, laborCost)
                if (result.success) {
                    setDiscountAmount(result.discountAmount)
                }
            }, 500)
            return () => clearTimeout(timeout)
        }
    }, [laborCost, couponCode, couponSuccess])

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
                    price: part.price,
                })),
                discountAmount,
                couponSuccess ? couponCode : null,
                sourcingMode
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
                setValue('technicalReport', result.data.commercial_description)
                setValue('laborCost', result.data.suggested_price)

                setFeedback({
                    type: 'success',
                    message: `Orçamento gerado! Serviço identificado: ${result.data.difficulty_reasoning}`
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

    async function handleApplyCoupon() {
        if (!couponCode) return
        setCouponError('')
        setCouponSuccess(false)
        setDiscountAmount(0)

        const currentLabor = watch('laborCost')
        if (!currentLabor || currentLabor <= 0) {
            setCouponError('Defina o valor da Mão de Obra primeiro.')
            return
        }

        const result = await validateCoupon(couponCode, currentLabor)
        if (result.success) {
            setDiscountAmount(result.discountAmount)
            setCouponSuccess(true)
        } else {
            setCouponError(result.error || 'Cupom inválido')
        }
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
                                        {isGeneratingAI ? 'Analisando...' : 'Sugerir Orçamento com IA'}
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

                            {/* Cupom de Desconto */}
                            <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-dashed border-primary/20">
                                <Label htmlFor="couponCode" className="text-foreground">Cupom de Desconto (NPS)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="couponCode"
                                        placeholder="VIP20-XXXX"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value.toUpperCase())
                                            setCouponSuccess(false)
                                            setDiscountAmount(0)
                                            setCouponError('')
                                        }}
                                        disabled={isSubmitting || couponSuccess}
                                        className="uppercase font-mono tracking-wide"
                                    />
                                    {couponSuccess ? (
                                        <Button type="button" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => {
                                            setCouponSuccess(false)
                                            setDiscountAmount(0)
                                            setCouponCode('')
                                        }}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleApplyCoupon}
                                            disabled={!couponCode || isSubmitting}
                                        >
                                            Aplicar
                                        </Button>
                                    )}
                                </div>
                                {couponError && <p className="text-sm text-destructive">{couponError}</p>}
                                {couponSuccess && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Cupom aplicado! Desconto de {formatCurrency(discountAmount)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Peças — Seletor de Modalidade */}
                            <div className="space-y-4">
                                <Label>Modalidade de Peças</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Compra Assistida */}
                                    <button
                                        type="button"
                                        onClick={() => setSourcingMode('assisted')}
                                        className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-center transition-all cursor-pointer ${sourcingMode === 'assisted'
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                                : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                                            }`}
                                    >
                                        <ShoppingCart className={`h-5 w-5 ${sourcingMode === 'assisted' ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={`text-sm font-semibold ${sourcingMode === 'assisted' ? 'text-primary' : 'text-foreground'}`}>Compra Assistida</span>
                                        <span className="text-[11px] text-muted-foreground leading-tight">Cliente compra pelo link que você indica</span>
                                    </button>

                                    {/* Revenda */}
                                    <button
                                        type="button"
                                        onClick={() => setSourcingMode('resale')}
                                        className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-center transition-all cursor-pointer ${sourcingMode === 'resale'
                                                ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/20'
                                                : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                                            }`}
                                    >
                                        <Briefcase className={`h-5 w-5 ${sourcingMode === 'resale' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                                        <span className={`text-sm font-semibold ${sourcingMode === 'resale' ? 'text-emerald-600' : 'text-foreground'}`}>Revenda</span>
                                        <span className="text-[11px] text-muted-foreground leading-tight">Você compra e revende (valor no orçamento)</span>
                                    </button>

                                    {/* Link de Parcelamento */}
                                    <button
                                        type="button"
                                        onClick={() => setSourcingMode('payment_link')}
                                        className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-center transition-all cursor-pointer ${sourcingMode === 'payment_link'
                                                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/20'
                                                : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                                            }`}
                                    >
                                        <Link2 className={`h-5 w-5 ${sourcingMode === 'payment_link' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                                        <span className={`text-sm font-semibold ${sourcingMode === 'payment_link' ? 'text-blue-600' : 'text-foreground'}`}>Link Parcelamento</span>
                                        <span className="text-[11px] text-muted-foreground leading-tight">Envia link para o cliente pagar/parcelar</span>
                                    </button>
                                </div>

                                {/* Header de Peças */}
                                <div className="flex items-center justify-between">
                                    <Label>
                                        {sourcingMode === 'assisted' && 'Peças Externas (Compra Assistida)'}
                                        {sourcingMode === 'resale' && 'Peças para Revenda'}
                                        {sourcingMode === 'payment_link' && 'Peças (Link de Parcelamento)'}
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ name: '', purchaseUrl: '', price: 0 })}
                                        disabled={isSubmitting}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Adicionar Peça
                                    </Button>
                                </div>

                                {fields.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                                        Nenhuma peça adicionada. Clique em &quot;Adicionar Peça&quot; se necessário.
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

                                        <div className={`grid gap-3 ${sourcingMode === 'payment_link' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                                            {/* Nome da Peça — sempre visível */}
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

                                            {/* Preço — visível em Revenda e Link Parcelamento */}
                                            {(sourcingMode === 'resale' || sourcingMode === 'payment_link') && (
                                                <div className="space-y-1">
                                                    <Label htmlFor={`part-price-${index}`}>Preço (R$)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                        <Input
                                                            id={`part-price-${index}`}
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0,00"
                                                            className="pl-10"
                                                            {...register(`externalParts.${index}.price`, { valueAsNumber: true })}
                                                            disabled={isSubmitting}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* URL — visível em Compra Assistida e Link Parcelamento */}
                                            {(sourcingMode === 'assisted' || sourcingMode === 'payment_link') && (
                                                <div className="space-y-1">
                                                    <Label htmlFor={`part-url-${index}`}>
                                                        {sourcingMode === 'assisted' ? 'Link de Compra' : 'Link de Pagamento'}
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id={`part-url-${index}`}
                                                            type="url"
                                                            placeholder={sourcingMode === 'assisted' ? 'https://mercadolivre.com.br/...' : 'https://pagseguro.com.br/...'}
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
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Resumo / Total */}
                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    {/* Mão de Obra */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Mão de Obra</span>
                                        <span className="font-medium">{formatCurrency(laborCost)}</span>
                                    </div>

                                    {/* Peças (Revenda) */}
                                    {sourcingMode === 'resale' && fields.length > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Peças ({fields.length}x)</span>
                                            <span className="font-medium">
                                                {formatCurrency(
                                                    (watch('externalParts') || []).reduce((sum, p) => sum + (p.price || 0), 0)
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {/* Desconto */}
                                    {discountAmount > 0 && (
                                        <div className="flex items-center justify-between text-sm text-green-600">
                                            <span>Desconto</span>
                                            <span className="font-medium">- {formatCurrency(discountAmount)}</span>
                                        </div>
                                    )}

                                    <hr className="my-1" />

                                    {/* Total */}
                                    <div className="flex items-center justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <div className="text-right">
                                            {discountAmount > 0 && (
                                                <div className="text-sm text-muted-foreground line-through">
                                                    {formatCurrency(
                                                        laborCost + (sourcingMode === 'resale' ? (watch('externalParts') || []).reduce((sum, p) => sum + (p.price || 0), 0) : 0)
                                                    )}
                                                </div>
                                            )}
                                            <span className="text-primary text-xl">
                                                {formatCurrency(
                                                    laborCost
                                                    + (sourcingMode === 'resale' ? (watch('externalParts') || []).reduce((sum, p) => sum + (p.price || 0), 0) : 0)
                                                    - discountAmount
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {sourcingMode === 'assisted' && '* O valor das peças será pago diretamente pelo cliente nos links indicados.'}
                                    {sourcingMode === 'resale' && '* Valor total inclui mão de obra e peças fornecidas pelo técnico.'}
                                    {sourcingMode === 'payment_link' && '* As peças serão pagas pelo cliente através dos links de pagamento enviados.'}
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
