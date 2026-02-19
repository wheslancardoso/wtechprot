import { z } from "zod"

export const leadSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    company_name: z.string().optional(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().min(10, "Telefone inválido (mínimo 10 dígitos)"),
    device_count: z.enum(["1-5", "6-20", "21-100", "100+"], {
        message: "Selecione a quantidade de equipamentos",
    }),
    service_interest: z.array(z.string()).optional(),
    message: z.string().optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>
