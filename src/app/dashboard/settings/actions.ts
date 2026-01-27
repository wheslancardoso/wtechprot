'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ==================================================
// Tipos
// ==================================================
export interface TenantSettings {
    id: string
    user_id: string
    trade_name: string
    legal_document: string | null
    phone: string | null
    email: string | null
    address: {
        street?: string
        number?: string
        complement?: string
        neighborhood?: string
        city?: string
        state?: string
        zip?: string
    }
    logo_url: string | null
    pix_key: string | null
    pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | null
    mei_limit_annual: number
    mei_limit_monthly: number
    warranty_days_labor: number
    warranty_days_parts: number
    created_at: string
    updated_at: string
}

// ==================================================
// Buscar Configurações do Usuário
// ==================================================
export async function getSettings(): Promise<{
    success: boolean
    data?: TenantSettings
    message?: string
}> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        // Tentar buscar settings existentes
        const { data: settings, error } = await supabase
            .from('tenant_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = not found
            console.error('Erro ao buscar settings:', error)
            return { success: false, message: error.message }
        }

        // Se não existe, criar com defaults
        if (!settings) {
            const { data: newSettings, error: insertError } = await supabase
                .from('tenant_settings')
                .insert({
                    user_id: user.id,
                    trade_name: 'Minha Assistência',
                    mei_limit_annual: 81000,
                    warranty_days_labor: 90,
                })
                .select()
                .single()

            if (insertError) {
                console.error('Erro ao criar settings:', insertError)
                return { success: false, message: insertError.message }
            }

            return { success: true, data: newSettings }
        }

        return { success: true, data: settings }
    } catch (error) {
        console.error('Erro inesperado:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Atualizar Dados da Loja
// ==================================================
export async function updateStoreInfo(data: {
    trade_name: string
    legal_document?: string
    phone?: string
    email?: string
    address?: TenantSettings['address']
}): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('tenant_settings')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            return { success: false, message: error.message }
        }

        revalidatePath('/dashboard/settings')
        return { success: true, message: 'Dados atualizados com sucesso!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Atualizar Logo
// ==================================================
export async function updateLogo(logoUrl: string): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('tenant_settings')
            .update({
                logo_url: logoUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            return { success: false, message: error.message }
        }

        revalidatePath('/dashboard/settings')
        return { success: true, message: 'Logo atualizada!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Atualizar Configurações Financeiras
// ==================================================
export async function updateFinancialSettings(data: {
    pix_key?: string
    pix_key_type?: TenantSettings['pix_key_type']
    mei_limit_annual?: number
}): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('tenant_settings')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            return { success: false, message: error.message }
        }

        revalidatePath('/dashboard/settings')
        revalidatePath('/dashboard/metrics')
        return { success: true, message: 'Configurações financeiras atualizadas!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Atualizar Garantia
// ==================================================
export async function updateWarrantySettings(data: {
    warranty_days_labor: number
    warranty_days_parts?: number
}): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('tenant_settings')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            return { success: false, message: error.message }
        }

        revalidatePath('/dashboard/settings')
        return { success: true, message: 'Configurações de garantia atualizadas!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}

// ==================================================
// Buscar Logs de Segurança
// ==================================================
export async function getSecurityLogs(): Promise<{
    success: boolean
    data?: Array<{
        id: string
        order_id: string
        previous_status: string | null
        new_status: string
        created_at: string
        formatted_date: string
    }>
    message?: string
}> {
    try {
        const supabase = await createClient()

        const { data: logs, error } = await supabase
            .from('order_logs')
            .select('id, order_id, previous_status, new_status, created_at')
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            if (error.code === '42P01') {
                // Tabela não existe ainda
                return { success: true, data: [] }
            }
            return { success: false, message: error.message }
        }

        const formattedLogs = (logs || []).map(log => {
            const date = new Date(log.created_at)
            const formatted = date.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).replace(',', ' às')

            return {
                ...log,
                formatted_date: formatted,
            }
        })

        return { success: true, data: formattedLogs }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        }
    }
}
