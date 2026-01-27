'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signup(formData: FormData): Promise<{
    success: boolean
    message: string
    needsEmailConfirmation?: boolean
}> {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validações
    if (!name || name.trim().length < 2) {
        return { success: false, message: 'Nome deve ter pelo menos 2 caracteres' }
    }

    if (!email || !email.includes('@')) {
        return { success: false, message: 'E-mail inválido' }
    }

    if (!password || password.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' }
    }

    if (password !== confirmPassword) {
        return { success: false, message: 'As senhas não conferem' }
    }

    // Obter origin para redirect
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    // Criar conta no Supabase
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name.trim(),
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error('Erro no signup:', error)

        if (error.message.includes('already registered')) {
            return { success: false, message: 'Este e-mail já está cadastrado' }
        }

        return { success: false, message: error.message }
    }

    // Verificar se precisa confirmar e-mail
    if (data.user && !data.session) {
        return {
            success: true,
            message: 'Conta criada! Verifique seu e-mail para ativar.',
            needsEmailConfirmation: true,
        }
    }

    return {
        success: true,
        message: 'Conta criada com sucesso!',
        needsEmailConfirmation: false,
    }
}
