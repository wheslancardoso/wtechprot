'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Server Action
import { finishOrderWithPayment } from '../actions'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// Icons
import {
    CheckCircle,
    AlertCircle,
    Loader2,
    Receipt,
    Printer,
    Copy,
    FileDown,
    CheckSquare,
} from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'

import PdfButtonWrapper from './pdf-button-wrapper'
import type { OrderData, StoreSettings } from '@/components/pdf/warranty-pdf'

// ==================================================
// Zod Schema
// ==================================================
const finishSchema = z.object({
    amountReceived: z.number().min(0, 'Valor inválido'),
    paymentMethod: z.enum(['pix', 'cash', 'card_machine']),
    checkoutChecklist: z.record(z.string(), z.boolean()).optional(),
})

type FinishFormData = z.infer<typeof finishSchema>

// ==================================================
// Props
// ==================================================
interface FinishOrderModalProps {
    orderId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    orderData?: OrderData
    storeSettings?: StoreSettings
    discountAmount?: number
}

// ==================================================
// Component
// ==================================================
export default function FinishOrderModal({ orderId, open, onOpenChange, orderData, storeSettings, discountAmount = 0 }: FinishOrderModalProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [receiptData, setReceiptData] = useState<{
        orderId: string
        amount: number
        method: string
        date: string
    } | null>(null)

    // Calculate initial amount (Labor - Discount)
    const initialAmount = Math.max(0, (orderData?.laborCost || 0) - discountAmount)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FinishFormData>({
        resolver: zodResolver(finishSchema),
        defaultValues: {
            amountReceived: initialAmount,
            paymentMethod: undefined as unknown as "pix" | "cash" | "card_machine",
            checkoutChecklist: {
                limpeza_ok: false,
                testes_ok: false,
                acessorios_ok: false,
                cliente_ciente: false,
            },
        } as any,
    })

    const paymentMethod = watch('paymentMethod')

    async function onSubmit(data: FinishFormData) {
        setIsSubmitting(true)
        setFeedback(null)

        try {
            const result = await finishOrderWithPayment(
                orderId,
                data.amountReceived,
                data.paymentMethod,
                data.checkoutChecklist as Record<string, boolean>
            )

            if (result.success) {
                // Preparar dados do recibo
                setReceiptData({
                    orderId: orderId.substring(0, 8).toUpperCase(),
                    amount: data.amountReceived,
                    method: data.paymentMethod === 'pix' ? 'PIX' :
                        data.paymentMethod === 'cash' ? 'Dinheiro' : 'Maquininha',
                    date: new Date().toLocaleDateString('pt-BR'),
                })
                setShowSuccess(true)
                reset()
                router.refresh()
            } else {
                setFeedback({ type: 'error', message: result.message })
            }
        } catch (error) {
            console.error('Erro ao finalizar:', error)
            setFeedback({
                type: 'error',
                message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleClose() {
        setShowSuccess(false)
        setReceiptData(null)
        setFeedback(null)
        onOpenChange(false)
    }

    function handlePrintReceipt() {
        // Abre janela de impressão
        window.print()
    }

    function copyReceiptText() {
        if (!receiptData) return

        const text = `
═══════════════════════════════════
        ${storeSettings?.trade_name?.toUpperCase() || 'WTECH SOLUÇÕES EM TECNOLOGIA'}
═══════════════════════════════════
RECIBO DE PAGAMENTO

OS: #${receiptData.orderId}
Data: ${receiptData.date}
Valor: R$ ${receiptData.amount.toFixed(2)}
Forma: ${receiptData.method}

───────────────────────────────────
TERMO DE GARANTIA

A ${storeSettings?.trade_name?.toUpperCase() || 'WTECH SOLUÇÕES EM TECNOLOGIA'} oferece
garantia de 90 (noventa) dias sobre
a MÃO DE OBRA do serviço prestado.

⚠️ ATENÇÃO: Peças adquiridas pelo
cliente em lojas externas possuem
garantia direta com o vendedor,
conforme CDC.

═══════════════════════════════════
    Obrigado pela preferência!
═══════════════════════════════════
`.trim()

        navigator.clipboard.writeText(text)
        alert('Recibo copiado para a área de transferência!')
    }

    const paymentMethodLabels = {
        pix: 'PIX',
        cash: 'Dinheiro',
        card_machine: 'Maquininha',
    }

    return (
        <Dialog open={open} onOpenChange={showSuccess ? handleClose : onOpenChange}>
            <DialogContent className="max-w-md">
                {/* ============================================ */}
                {/* TELA DE SUCESSO - RECIBO */}
                {/* ============================================ */}
                {showSuccess && receiptData ? (
                    <div className="py-4 space-y-6">
                        {/* Header Sucesso */}
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-green-600">OS Finalizada!</h2>
                            <p className="text-sm text-muted-foreground">Pagamento registrado com sucesso</p>
                        </div>

                        {/* Recibo Visual */}
                        <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2 print:bg-white">
                            <div className="text-center border-b pb-2 mb-2">
                                <p className="font-bold">{storeSettings?.trade_name || 'WTECH ASSISTÊNCIA'}</p>
                                <p className="text-xs text-muted-foreground">Recibo de Pagamento</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>OS:</span>
                                    <span className="font-semibold">#{receiptData.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Data:</span>
                                    <span>{receiptData.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Valor:</span>
                                    <span className="font-semibold text-green-600">
                                        R$ {receiptData.amount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Forma:</span>
                                    <span>{receiptData.method}</span>
                                </div>
                            </div>

                            <div className="border-t pt-2 mt-2">
                                <p className="text-xs text-center text-muted-foreground">
                                    <strong>GARANTIA:</strong> 90 dias sobre mão de obra.
                                    <br />
                                    Peças externas: garantia com o vendedor.
                                </p>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col gap-2">
                            {orderData && storeSettings ? (
                                <PdfButtonWrapper orderData={orderData} storeSettings={storeSettings} />
                            ) : (
                                <Button onClick={handlePrintReceipt} variant="outline">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir Recibo
                                </Button>
                            )}

                            <Button onClick={copyReceiptText} variant="outline">
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar Texto do Recibo
                            </Button>
                            <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700">
                                Fechar
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* ============================================ */
                    /* FORMULÁRIO DE PAGAMENTO */
                    /* ============================================ */
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Finalizar OS e Registrar Pagamento
                            </DialogTitle>
                            <DialogDescription>
                                Registre o valor recebido e a forma de pagamento.
                                Nenhum gateway online é utilizado.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Feedback */}
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

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Valor Recebido */}
                            <div className="space-y-2">
                                <Label htmlFor="amountReceived">Valor Recebido (R$) *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        R$
                                    </span>
                                    <Input
                                        id="amountReceived"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder={initialAmount.toFixed(2)}
                                        className="pl-10"
                                        {...register('amountReceived', { valueAsNumber: true })}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.amountReceived && (
                                    <p className="text-sm text-destructive">{errors.amountReceived.message}</p>
                                )}
                            </div>

                            {/* Checklist de Saída */}
                            <div className="space-y-3 pt-2 border-t">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4" /> Checklist de Saída (Opcional)
                                </Label>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="limpeza_ok"
                                            checked={!!watch('checkoutChecklist.limpeza_ok')}
                                            onCheckedChange={(checked) => setValue('checkoutChecklist.limpeza_ok', !!checked)}
                                        />
                                        <label htmlFor="limpeza_ok" className="text-xs font-medium leading-none cursor-pointer">
                                            Limpeza realizada
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="testes_ok"
                                            checked={!!watch('checkoutChecklist.testes_ok')}
                                            onCheckedChange={(checked) => setValue('checkoutChecklist.testes_ok', !!checked)}
                                        />
                                        <label htmlFor="testes_ok" className="text-xs font-medium leading-none cursor-pointer">
                                            Testes concluídos
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="acessorios_ok"
                                            checked={!!watch('checkoutChecklist.acessorios_ok')}
                                            onCheckedChange={(checked) => setValue('checkoutChecklist.acessorios_ok', !!checked)}
                                        />
                                        <label htmlFor="acessorios_ok" className="text-xs font-medium leading-none cursor-pointer">
                                            Acessórios devolvidos
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="cliente_ciente"
                                            checked={!!watch('checkoutChecklist.cliente_ciente')}
                                            onCheckedChange={(checked) => setValue('checkoutChecklist.cliente_ciente', !!checked)}
                                        />
                                        <label htmlFor="cliente_ciente" className="text-xs font-medium leading-none cursor-pointer">
                                            Cliente ciente da garantia
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Método de Pagamento */}
                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                                <Select
                                    value={paymentMethod}
                                    onValueChange={(value) => setValue('paymentMethod', value as 'pix' | 'cash' | 'card_machine', { shouldValidate: true })}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger id="paymentMethod">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pix">💠 PIX</SelectItem>
                                        <SelectItem value="cash">💵 Dinheiro</SelectItem>
                                        <SelectItem value="card_machine">💳 Maquininha</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.paymentMethod && (
                                    <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
                                )}
                            </div>

                            {/* Aviso Legal */}
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    <strong>Importante:</strong> O recibo gerado inclui termo de garantia de 90 dias
                                    sobre a mão de obra. Peças externas têm garantia com o vendedor original.
                                </AlertDescription>
                            </Alert>

                            {/* Mostrar erros genéricos do formulário se houver (para debug/alerta visual) */}
                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertDescription className="text-xs">
                                        Por favor, preencha todos os campos obrigatórios corretamente antes de finalizar.
                                        {/* DEBUG - TO BE REMOVED */}
                                        <br />
                                        <span className="font-mono text-xs">{JSON.stringify(errors, null, 2)}</span>
                                    </AlertDescription>
                                </Alert>
                            )}

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
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Finalizando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Finalizar OS
                                        </>
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
