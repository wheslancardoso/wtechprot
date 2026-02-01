'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { saveService } from './actions'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Loader2 } from 'lucide-react'
import type { ServiceCatalogItem } from '@/types/service-catalog'

const serviceSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    price_min: z.coerce.number().min(0, 'Preço deve ser positivo'),
    price_max: z.coerce.number().min(0, 'Preço deve ser positivo'),
    category: z.string().min(1, 'Selecione ou digite uma categoria'),
    active: z.boolean().default(true),
}).refine(data => data.price_min <= data.price_max, {
    message: "Preço mínimo não pode ser maior que o máximo",
    path: ["price_min"],
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    serviceToEdit?: ServiceCatalogItem | null
}

const CATEGORIES = [
    "Computadores",
    "Notebooks",
    "Impressoras",
    "Celulares",
    "Redes",
    "Software",
    "Diagnóstico",
    "Outros"
]

export default function ServiceModal({ open, onOpenChange, serviceToEdit }: ServiceModalProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [serverError, setServerError] = useState('')

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: '',
            description: '',
            price_min: 0,
            price_max: 0,
            category: 'Computadores',
            active: true,
        },
    })

    // Pre-fill form when editing
    useEffect(() => {
        if (serviceToEdit) {
            reset({
                id: serviceToEdit.id,
                name: serviceToEdit.name,
                description: serviceToEdit.description,
                price_min: Number(serviceToEdit.price_min),
                price_max: Number(serviceToEdit.price_max),
                category: serviceToEdit.category,
                active: serviceToEdit.active,
            })
        } else {
            reset({
                name: '',
                description: '',
                price_min: 0,
                price_max: 0,
                category: 'Computadores',
                active: true,
            })
        }
    }, [serviceToEdit, open, reset])

    const onSubmit = async (data: ServiceFormData) => {
        setIsSubmitting(true)
        setServerError('')

        const formData = new FormData()
        if (data.id) formData.append('id', data.id)
        formData.append('name', data.name)
        formData.append('description', data.description)
        formData.append('price_min', String(data.price_min))
        formData.append('price_max', String(data.price_max))
        formData.append('category', data.category)
        if (data.active) formData.append('active', 'on')

        try {
            const result = await saveService({}, formData)

            if (result.errors) {
                // Handle server-side validation errors if necessary
                console.error(result.errors)
                setServerError('Erro na validação do servidor.')
            } else if (result.message && !result.message.includes('sucesso')) {
                setServerError(result.message)
            } else {
                onOpenChange(false)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            setServerError('Erro inesperado ao salvar.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{serviceToEdit ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do serviço. Defina a faixa de preço (Min/Max) para ajudar a IA.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {serverError && (
                        <div className="text-red-500 text-sm font-medium">{serverError}</div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select
                                onValueChange={(val) => setValue('category', val)}
                                defaultValue={watch('category')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
                        </div>

                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <Label htmlFor="name">Nome do Serviço</Label>
                            <Input id="name" {...register('name')} placeholder="Ex: Formatação Simples" />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição (Prompt para IA)</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Descreva detalhadamente o que é feito. A IA usará este texto."
                            rows={4}
                        />
                        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price_min">Preço Mínimo (R$)</Label>
                            <Input
                                id="price_min"
                                type="number"
                                step="0.01"
                                {...register('price_min')}
                            />
                            {errors.price_min && <p className="text-red-500 text-xs">{errors.price_min.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price_max">Preço Máximo (R$)</Label>
                            <Input
                                id="price_max"
                                type="number"
                                step="0.01"
                                {...register('price_max')}
                            />
                            {errors.price_max && <p className="text-red-500 text-xs">{errors.price_max.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="active"
                            checked={watch('active')}
                            onCheckedChange={(checked) => setValue('active', checked as boolean)}
                        />
                        <Label htmlFor="active" className="cursor-pointer">Serviço Ativo no Catálogo</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {serviceToEdit ? 'Salvar Alterações' : 'Criar Serviço'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
