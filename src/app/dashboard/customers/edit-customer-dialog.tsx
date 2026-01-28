'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateCustomer, type CustomerWithStats } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Loader2, Save } from 'lucide-react'

// Schema
const editCustomerSchema = z.object({
    name: z.string().min(2, 'Nome obrigatório'),
    phone: z.string().min(10, 'Telefone inválido').optional().or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    address: z.string().optional(),
})

type EditCustomerData = z.infer<typeof editCustomerSchema>

interface EditCustomerDialogProps {
    customer: CustomerWithStats
    onUpdate: () => void
}

export function EditCustomerDialog({ customer, onUpdate }: EditCustomerDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EditCustomerData>({
        resolver: zodResolver(editCustomerSchema),
        defaultValues: {
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
        },
    })

    async function onSubmit(data: EditCustomerData) {
        setIsSubmitting(true)
        try {
            const result = await updateCustomer(customer.id, {
                name: data.name,
                phone: data.phone || undefined,
                email: data.email || undefined,
                address: data.address || undefined,
            })

            if (result.success) {
                setIsOpen(false)
                onUpdate()
            } else {
                alert(result.message)
            }
        } catch (error) {
            console.error(error)
            alert('Erro ao atualizar')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                    <DialogDescription>
                        Atualize os dados de cadastrais do cliente.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Telefone / WhatsApp</Label>
                            <Input {...register('phone')} />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input {...register('email')} type="email" />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Endereço</Label>
                        <Input {...register('address')} placeholder="Rua, Número, Bairro" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
