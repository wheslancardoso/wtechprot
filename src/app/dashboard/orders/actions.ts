'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ==================================================
// Zod Schema para validação
// ==================================================
const createOrderSchema = z.object({
    // Cliente
    customerCpf: z.string().min(11, 'CPF inválido'),
    customerName: z.string().min(2, 'Nome obrigatório'),
    customerPhone: z.string().min(10, 'WhatsApp inválido'),

    // Equipamento
    equipmentType: z.string().min(1, 'Tipo obrigatório'),
    equipmentBrand: z.string().optional(),
    equipmentModel: z.string().optional(),
    equipmentPassword: z.string().optional(),

    // Detalhes
    defectReport: z.string().min(10, 'Descreva o problema'),
    hasAccessories: z.string().optional(), // FormData envia como string
    accessoriesDescription: z.string().optional(),
})

// ==================================================
// Tipo de retorno padrão
// ==================================================
type ActionResult = {
    success: boolean
    message: string
    orderId?: string
}

// ==================================================
// Server Action: Criar Ordem de Serviço
// ==================================================
export async function createOrder(formData: FormData): Promise<ActionResult> {
    try {
        // 1. Extrair e validar dados do FormData
        const rawData = {
            customerCpf: formData.get('customerCpf') as string,
            customerName: formData.get('customerName') as string,
            customerPhone: formData.get('customerPhone') as string,
            equipmentType: formData.get('equipmentType') as string,
            equipmentBrand: formData.get('equipmentBrand') as string,
            equipmentModel: formData.get('equipmentModel') as string,
            equipmentPassword: formData.get('equipmentPassword') as string,
            defectReport: formData.get('defectReport') as string,
            hasAccessories: formData.get('hasAccessories') as string,
            accessoriesDescription: formData.get('accessoriesDescription') as string,
        }

        const validatedData = createOrderSchema.parse(rawData)

        // 2. Criar cliente Supabase
        const supabase = await createClient()

        // 3. Verificar usuário autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        // 4. Limpar CPF (remover máscara)
        const cpfClean = validatedData.customerCpf.replace(/\D/g, '')

        // 5. Verificar se cliente já existe pelo CPF
        let customerId: string

        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('document_id', cpfClean)
            .eq('user_id', user.id)
            .single()

        if (existingCustomer) {
            // Cliente já existe, usar ID existente
            customerId = existingCustomer.id
        } else {
            // Criar novo cliente
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert({
                    user_id: user.id,
                    name: validatedData.customerName,
                    phone: validatedData.customerPhone,
                    document_id: cpfClean,
                })
                .select('id')
                .single()

            if (customerError || !newCustomer) {
                console.error('Erro ao criar cliente:', customerError)
                return { success: false, message: `Erro ao criar cliente: ${customerError?.message}` }
            }

            customerId = newCustomer.id
        }

        // 6. Criar equipamento
        const { data: equipment, error: equipmentError } = await supabase
            .from('equipments')
            .insert({
                customer_id: customerId,
                type: validatedData.equipmentType,
                brand: validatedData.equipmentBrand || null,
                model: validatedData.equipmentModel || null,
                notes: validatedData.equipmentPassword
                    ? `Senha: ${validatedData.equipmentPassword}`
                    : null,
            })
            .select('id')
            .single()

        if (equipmentError || !equipment) {
            console.error('Erro ao criar equipamento:', equipmentError)
            return { success: false, message: `Erro ao criar equipamento: ${equipmentError?.message}` }
        }

        // 7. Montar texto de diagnóstico inicial
        const hasAccessories = validatedData.hasAccessories === 'on' || validatedData.hasAccessories === 'true'
        const accessoriesText = hasAccessories
            ? `Acessórios: ${validatedData.accessoriesDescription || 'Sim (não especificados)'}`
            : 'Sem acessórios'

        const diagnosisText = `Relato do cliente:\n${validatedData.defectReport}\n\n${accessoriesText}`

        // 8. Criar ordem de serviço
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                customer_id: customerId,
                equipment_id: equipment.id,
                status: 'open',
                labor_cost: 0,
                parts_cost_external: 0,
                diagnosis_text: diagnosisText,
            })
            .select('id, display_id')
            .single()

        if (orderError || !order) {
            console.error('Erro ao criar OS:', orderError)
            return { success: false, message: `Erro ao criar OS: ${orderError?.message}` }
        }

        // 9. Revalidar cache da listagem
        revalidatePath('/dashboard/orders')

        // 10. Retornar sucesso
        return {
            success: true,
            message: `OS #${order.display_id} criada com sucesso!`,
            orderId: order.id,
        }

    } catch (error) {
        // Erro de validação Zod
        if (error instanceof z.ZodError) {
            const firstError = error.errors[0]
            return {
                success: false,
                message: `Validação falhou: ${firstError.path.join('.')} - ${firstError.message}`
            }
        }

        // Outros erros
        console.error('Erro inesperado ao criar OS:', error)
        return {
            success: false,
            message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}
