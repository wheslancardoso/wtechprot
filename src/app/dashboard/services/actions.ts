'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ServiceCatalogItem, ServiceCatalogState } from '@/types/service-catalog'

const serviceSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    price_min: z.coerce.number().min(0, 'Preço mínimo deve ser maior ou igual a 0'),
    price_max: z.coerce.number().min(0, 'Preço máximo deve ser maior ou igual a 0'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    estimated_time: z.string().optional(),
    active: z.coerce.boolean().optional(),
})

export async function getServices(): Promise<ServiceCatalogItem[]> {
    const supabase = await createClient()

    const { data: services, error } = await supabase
        .from('service_catalog')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching services:', error)
        return []
    }

    return services as ServiceCatalogItem[]
}

export async function saveService(
    prevState: ServiceCatalogState,
    formData: FormData
): Promise<ServiceCatalogState> {
    const validatedFields = serviceSchema.safeParse({
        id: formData.get('id') || undefined,
        name: formData.get('name'),
        description: formData.get('description'),
        price_min: formData.get('price_min'),
        price_max: formData.get('price_max'),
        category: formData.get('category'),
        estimated_time: formData.get('estimated_time'),
        active: formData.get('active') === 'on',
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Erro ao validar campos. Verifique os dados inseridos.',
        }
    }

    const { id, price_min, price_max, ...data } = validatedFields.data

    if (price_min > price_max) {
        return {
            errors: {
                price_min: ['Preço mínimo não pode ser maior que o preço máximo'],
            },
            message: 'Inconsistência nos preços.',
        }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: 'Usuário não autenticado.' }
    }

    // Get tenant_id (assuming simple mapping or metadata, but for now we trust RLS or fetch it)
    // Actually RLS uses auth.uid() = tenant_id, so we assume the user IS the tenant (or linked to one).
    // The migration said: using (auth.uid() = tenant_id). So we just need to pass tenant_id as auth.uid()
    // or let the DB handle it if default? No, the table definition has tenant_id NOT NULL.
    // So we must provide it.

    // Check if we need to know the tenant_id explicitly. 
    // In many Supabase setups with RLS, if the policy checks auth.uid() = tenant_id, 
    // we should insert with tenant_id = user.id.

    const payload = {
        ...data,
        price_min,
        price_max,
        tenant_id: user.id, // Assuming 1:1 for the RLS policy "auth.uid() = tenant_id"
    }

    try {
        if (id) {
            // Update
            const { error } = await supabase
                .from('service_catalog')
                .update(payload)
                .eq('id', id)

            if (error) throw error
        } else {
            // Create
            const { error } = await supabase
                .from('service_catalog')
                .insert(payload)

            if (error) throw error
        }
    } catch (error) {
        console.error('Database Error:', error)
        return { message: 'Erro ao salvar serviço. Tente novamente.' }
    }

    revalidatePath('/dashboard/services')
    return { message: 'Serviço salvo com sucesso!' }
}

export async function deleteService(id: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('service_catalog')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/dashboard/services')
        return { message: 'Serviço excluído com sucesso.' }
    } catch (error) {
        console.error('Error deleting service:', error)
        return { message: 'Erro ao excluir serviço.' }
    }
}
