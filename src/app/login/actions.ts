'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type ActionResult = {
    success: boolean
    message: string
}

export async function login(formData: FormData): Promise<ActionResult> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validação básica
    if (!email || !password) {
        return { success: false, message: 'Email e senha são obrigatórios.' }
    }

    if (!email.includes('@')) {
        return { success: false, message: 'Formato de email inválido.' }
    }

    if (password.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres.' }
    }

    try {
        const supabase = await createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Erro de login:', error.message)

            // Mensagens amigáveis em português
            if (error.message.includes('Invalid login credentials')) {
                return { success: false, message: 'Email ou senha incorretos.' }
            }
            if (error.message.includes('Email not confirmed')) {
                return { success: false, message: 'Confirme seu email antes de fazer login.' }
            }
            if (error.message.includes('Too many requests')) {
                return { success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }
            }

            return { success: false, message: error.message }
        }

        // Sucesso - limpar cache e redirecionar
        revalidatePath('/', 'layout')

    } catch (error) {
        console.error('Erro inesperado no login:', error)
        return {
            success: false,
            message: 'Erro ao conectar com o servidor. Tente novamente.'
        }
    }

    // Redirect fora do try/catch (Next.js requirement)
    redirect('/dashboard/orders')
}

export async function logout(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
