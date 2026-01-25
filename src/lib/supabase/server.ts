import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Verificação de segurança para variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '❌ Missing Environment Variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are not defined. ' +
        'Please check your .env.local file.'
    )
}

export async function createClient() {
    // Next.js 15: cookies() agora é assíncrono
    const cookieStore = await cookies()

    return createServerClient(supabaseUrl!, supabaseAnonKey!, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options)
                    })
                } catch {
                    // O método setAll foi chamado de um Server Component.
                    // Isso pode ser ignorado se você tiver middleware atualizando
                    // as sessões do usuário.
                }
            },
        },
    })
}
