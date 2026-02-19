'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leadSchema, LeadFormData } from "@/lib/validations/lead-schema"
import { submitLead } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useTransition } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function LeadForm() {
    const [isPending, startTransition] = useTransition()
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LeadFormData>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            service_interest: [],
        }
    })

    const onSubmit = (data: LeadFormData) => {
        startTransition(async () => {
            const formData = new FormData()
            // Append basic fields
            if (data.name) formData.append('name', data.name)
            if (data.company_name) formData.append('company_name', data.company_name)
            if (data.email) formData.append('email', data.email)
            if (data.phone) formData.append('phone', data.phone)
            if (data.device_count) formData.append('device_count', data.device_count)
            if (data.message) formData.append('message', data.message)

            // Append arrays if needed (service_interest)
            if (data.service_interest && data.service_interest.length > 0) {
                data.service_interest.forEach(interest => {
                    formData.append('service_interest', interest)
                })
            }

            const result = await submitLead(null, formData)

            if (result.success) {
                setIsSuccess(true)
                toast.success(result.message)
            } else {
                toast.error(result.message || "Erro ao enviar formulário")
            }
        })
    }

    if (isSuccess) {
        return (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 p-8 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Solicitação Recebida!</h3>
                <p className="text-green-700 dark:text-green-400 mb-6">
                    Nossa equipe comercial receberá sua demanda e entrará em contato pelo WhatsApp cadastrado em instantes.
                </p>
                <Button variant="outline" onClick={() => setIsSuccess(false)}>
                    Enviar outra solicitação
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Falar com Consultor</h3>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nome Completo *</label>
                    <Input {...register("name")} placeholder="Seu nome" disabled={isPending} />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Empresa</label>
                    <Input {...register("company_name")} placeholder="Nome da sua empresa" disabled={isPending} />
                    {errors.company_name && <p className="text-xs text-red-500">{errors.company_name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">WhatsApp *</label>
                    <Input {...register("phone")} placeholder="(DDD) 99999-9999" disabled={isPending} />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Qtd. Computadores</label>
                    <Select onValueChange={(val) => setValue("device_count", val as any)} disabled={isPending}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o porte..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1-5">1 a 5 (Pequeno Porte)</SelectItem>
                            <SelectItem value="6-20">6 a 20 (Médio Porte)</SelectItem>
                            <SelectItem value="21-100">21 a 100 (Crescimento)</SelectItem>
                            <SelectItem value="100+">Acima de 100 (Corporativo)</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.device_count && <p className="text-xs text-red-500">{errors.device_count.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Como podemos ajudar?</label>
                    <Textarea {...register("message")} placeholder="Ex: Preciso de manutenção preventiva nos notebooks..." disabled={isPending} className="resize-none h-24" />
                </div>
            </div>

            <Button type="submit" size="lg" className="w-full font-bold bg-primary hover:bg-primary/90 mt-4" disabled={isPending}>
                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</> : "Receber Proposta"}
            </Button>

            <p className="text-xs text-slate-500 text-center mt-2">
                Seus dados estão protegidos.
            </p>
        </form>
    )
}
