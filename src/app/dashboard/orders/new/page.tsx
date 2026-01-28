'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Server Action
import { createOrder, getCustomerByCpf } from '../actions'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// Icons
import {
    AlertTriangle,
    Eye,
    EyeOff,
    User,
    Monitor,
    Search,
    Loader2,
    ArrowLeft,
    CheckSquare,
    CheckCircle,
    XCircle,
} from 'lucide-react'

// ==================================================
// Zod Schema
// ==================================================
const newOrderSchema = z.object({
    customerCpf: z.string().min(11, 'CPF inválido'),
    customerName: z.string().min(2, 'Nome obrigatório'),
    customerPhone: z.string().min(10, 'WhatsApp inválido'),
    equipmentType: z.string().min(1, 'Selecione o tipo'),
    equipmentBrand: z.string().optional(),
    equipmentModel: z.string().optional(),
    equipmentPassword: z.string().optional(),
    defectReport: z.string().min(10, 'Descreva o problema'),
    hasAccessories: z.boolean(),
    accessoriesDescription: z.string().optional(),
})

type NewOrderFormData = z.infer<typeof newOrderSchema>

// ==================================================
// Equipment Types
// ==================================================
const equipmentTypes = [
    { value: 'Notebook', label: 'Notebook' },
    { value: 'Desktop', label: 'Desktop' },
    { value: 'Impressora', label: 'Impressora' },
    { value: 'All in One', label: 'All in One' },
    { value: 'Monitor', label: 'Monitor' },
    { value: 'Smartphone', label: 'Smartphone' },
    { value: 'Tablet', label: 'Tablet' },
    { value: 'Outro', label: 'Outro' },
]

// ==================================================
// CPF Mask Helper
// ==================================================
function formatCpf(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
}

// ==================================================
// Component
// ==================================================
export default function NewOrderPage() {
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<NewOrderFormData>({
        resolver: zodResolver(newOrderSchema),
        defaultValues: {
            customerCpf: '',
            customerName: '',
            customerPhone: '',
            equipmentType: '',
            equipmentBrand: '',
            equipmentModel: '',
            equipmentPassword: '',
            defectReport: '',
            hasAccessories: false,
            accessoriesDescription: '',
        },
    })

    const hasAccessories = watch('hasAccessories')
    const cpfValue = watch('customerCpf')

    // Handle CPF input with mask + Auto search
    async function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value
        // Formatar apenas números iniciais para máscara
        const formatted = formatCpf(raw)

        // Verifica se mudou a quantidade de caracteres para evitar loop
        if (formatted !== cpfValue) {
            setValue('customerCpf', formatted)

            // Se tiver 14 caracteres (formato completo 000.000.000-00), buscar
            const clean = formatted.replace(/\D/g, '')
            if (clean.length === 11) {
                await searchCustomer(clean)
            }
        }
    }

    async function searchCustomer(cpfClean: string) {
        setIsSearchingCustomer(true)
        try {
            const result = await getCustomerByCpf(cpfClean)
            if (result.success && result.data) {
                setValue('customerName', result.data.name)
                setValue('customerPhone', result.data.phone)

                // Opcional: Mostrar feedback visual discreto
                // setFeedback({ type: 'success', message: 'Cliente encontrado!' })
                // Ou apenas focar no próximo campo
            }
        } catch (error) {
            console.error('Erro ao buscar cliente', error)
        } finally {
            setIsSearchingCustomer(false)
        }
    }

    // Submit handler - chama a Server Action
    async function onSubmit(data: NewOrderFormData) {
        setIsSubmitting(true)
        setFeedback(null)

        try {
            // Criar FormData para a Server Action
            const formData = new FormData()
            formData.append('customerCpf', data.customerCpf)
            formData.append('customerName', data.customerName)
            formData.append('customerPhone', data.customerPhone)
            formData.append('equipmentType', data.equipmentType)
            formData.append('equipmentBrand', data.equipmentBrand || '')
            formData.append('equipmentModel', data.equipmentModel || '')
            formData.append('equipmentPassword', data.equipmentPassword || '')
            formData.append('defectReport', data.defectReport)
            formData.append('hasAccessories', data.hasAccessories ? 'on' : '')
            formData.append('accessoriesDescription', data.accessoriesDescription || '')

            // Chamar Server Action
            const result = await createOrder(formData)

            if (result.success) {
                setFeedback({ type: 'success', message: result.message })
                reset() // Limpar formulário

                // Redirecionar após 1.5s para o usuário ver o feedback
                if (result.orderId) {
                    setTimeout(() => {
                        router.push(`/dashboard/orders/${result.orderId}`)
                    }, 1500)
                }
            } else {
                setFeedback({ type: 'error', message: result.message })
            }
        } catch (error) {
            setFeedback({
                type: 'error',
                message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Nova Ordem de Serviço</h1>
            </div>

            {/* Alert - Compra Assistida */}
            <Alert variant="warning" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Modelo Compra Assistida</AlertTitle>
                <AlertDescription>
                    Peças devem ser compradas pelo cliente via link externo. Você cobra apenas a mão de obra.
                </AlertDescription>
            </Alert>

            {/* Feedback de Sucesso/Erro */}
            {feedback && (
                <Alert
                    variant={feedback.type === 'success' ? 'success' : 'destructive'}
                    className="mb-6"
                >
                    {feedback.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{feedback.type === 'success' ? 'Sucesso!' : 'Erro'}</AlertTitle>
                    <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Grid: Cliente + Equipamento */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Card: Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* CPF */}
                            <div className="space-y-2">
                                <Label htmlFor="customerCpf">CPF *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="customerCpf"
                                        placeholder="000.000.000-00"
                                        value={cpfValue}
                                        onChange={handleCpfChange}
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={isSubmitting || isSearchingCustomer}
                                        onClick={() => {
                                            const clean = cpfValue.replace(/\D/g, '')
                                            if (clean.length === 11) searchCustomer(clean)
                                        }}
                                    >
                                        {isSearchingCustomer ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {errors.customerCpf && (
                                    <p className="text-sm text-destructive">{errors.customerCpf.message}</p>
                                )}
                            </div>

                            {/* Nome */}
                            <div className="space-y-2">
                                <Label htmlFor="customerName">Nome Completo *</Label>
                                <Input
                                    id="customerName"
                                    placeholder="João da Silva"
                                    {...register('customerName')}
                                    disabled={isSubmitting}
                                />
                                {errors.customerName && (
                                    <p className="text-sm text-destructive">{errors.customerName.message}</p>
                                )}
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-2">
                                <Label htmlFor="customerPhone">WhatsApp *</Label>
                                <Input
                                    id="customerPhone"
                                    placeholder="(11) 99999-9999"
                                    {...register('customerPhone')}
                                    disabled={isSubmitting}
                                />
                                {errors.customerPhone && (
                                    <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card: Equipamento */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Monitor className="h-5 w-5" />
                                Equipamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Tipo */}
                            <div className="space-y-2">
                                <Label>Tipo *</Label>
                                <Select
                                    onValueChange={(value) => setValue('equipmentType', value)}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {equipmentTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.equipmentType && (
                                    <p className="text-sm text-destructive">{errors.equipmentType.message}</p>
                                )}
                            </div>

                            {/* Marca + Modelo */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="equipmentBrand">Marca</Label>
                                    <Input
                                        id="equipmentBrand"
                                        placeholder="Dell, HP..."
                                        {...register('equipmentBrand')}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="equipmentModel">Modelo</Label>
                                    <Input
                                        id="equipmentModel"
                                        placeholder="Inspiron 15"
                                        {...register('equipmentModel')}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="equipmentPassword">Senha de Login</Label>
                                <div className="relative">
                                    <Input
                                        id="equipmentPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Senha do Windows/Mac"
                                        className="pr-10"
                                        {...register('equipmentPassword')}
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Card: Detalhes da OS */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckSquare className="h-5 w-5" />
                            Detalhes da OS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Relato do Defeito */}
                        <div className="space-y-2">
                            <Label htmlFor="defectReport">Relato do Problema / Defeito *</Label>
                            <Textarea
                                id="defectReport"
                                placeholder="Descreva detalhadamente o problema relatado pelo cliente..."
                                rows={4}
                                {...register('defectReport')}
                                disabled={isSubmitting}
                            />
                            {errors.defectReport && (
                                <p className="text-sm text-destructive">{errors.defectReport.message}</p>
                            )}
                        </div>

                        {/* Acessórios */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hasAccessories"
                                    className="h-4 w-4 rounded border-input"
                                    {...register('hasAccessories')}
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="hasAccessories" className="cursor-pointer">
                                    Acessórios deixados (Fonte, Cabo, Case, etc.)
                                </Label>
                            </div>

                            {hasAccessories && (
                                <Input
                                    placeholder="Descreva os acessórios..."
                                    {...register('accessoriesDescription')}
                                    disabled={isSubmitting}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        asChild
                        disabled={isSubmitting}
                    >
                        <Link href="/dashboard/orders">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando OS...
                            </>
                        ) : (
                            'Abrir OS'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
