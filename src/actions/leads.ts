'use server'

import { createClient } from "@/lib/supabase/server"
import { leadSchema, LeadFormData } from "@/lib/validations/lead-schema"
import { revalidatePath } from "next/cache"

export type ActionState = {
    success?: boolean
    message?: string
    errors?: Record<string, string[]>
}

export async function submitLead(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    // 1. Parse FormData manually because checkboxes/selects handle weirdly with Object.fromEntries sometimes
    // But for this simple form, Object.fromEntries is fine, except for arrays.

    const rawData: Record<string, any> = {}
    formData.forEach((value, key) => {
        // Handle arrays (service_interest) if multiple values
        if (rawData[key]) {
            if (!Array.isArray(rawData[key])) {
                rawData[key] = [rawData[key]]
            }
            rawData[key].push(value)
        } else {
            rawData[key] = value
        }
    })

    // 2. Validate with Zod
    const validatedFields = leadSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Erro de validação. Verifique os campos.",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { data } = validatedFields

    // 3. Insert into Supabase
    const supabase = await createClient()

    // Get tenant_id? The form is public, so no tenant context.
    // Unless we hardcode the DEFAULT_TENANT_ID or query it.
    // For now, let's insert NULL or try to get it if we can.
    // The table definition references tenants, so it might enforce FK.
    // But my migration said "Optional: Link to tenant logic".
    // Let's use the default tenant ID from page.tsx logic if available, or fetch it.
    // For simplicity, we can fetch the hardcoded tenant we used in page.tsx: '8132d666-06c0-46a7-b362-a30393be96c0'
    const DEFAULT_TENANT_ID = '8132d666-06c0-46a7-b362-a30393be96c0'

    try {
        const { error } = await supabase.from('leads').insert({
            name: data.name,
            company_name: data.company_name,
            email: data.email,
            phone: data.phone,
            device_count: data.device_count,
            service_interest: data.service_interest,
            message: data.message,
            tenant_id: DEFAULT_TENANT_ID,
            status: 'new'
        })

        if (error) {
            console.error("Erro ao salvar lead:", error)
            return { success: false, message: "Erro ao salvar seus dados. Tente novamente." }
        }

        revalidatePath("/dashboard/leads")
        return { success: true, message: "Recebemos seu contato! Um especialista falará com você em breve." }

    } catch (err) {
        console.error("Erro inesperado submitLead:", err)
        return { success: false, message: "Erro interno. Tente novamente mais tarde." }
    }
}

export async function getLeads() {
    const supabase = await createClient()

    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Erro ao buscar leads:", error)
        return []
    }

    return leads
}
