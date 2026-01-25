import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Higieniza e valida a URL do Supabase
 */
function sanitizeSupabaseUrl(rawUrl: string | undefined): string {
    if (!rawUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definida')
    }

    // Limpar: remover espaços, aspas e caracteres invisíveis
    let url = rawUrl
        .trim()
        .replace(/['"]/g, '')
        .replace(/\s+/g, '')

    // Garantir que começa com https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Se parece ser um projeto Supabase (contém .supabase.co)
        if (url.includes('.supabase.co') || url.includes('supabase')) {
            url = `https://${url}`
        } else {
            throw new Error(
                `URL inválida: "${url.substring(0, 20)}...". Deve começar com https:// e ser uma URL válida do Supabase.`
            )
        }
    }

    // Validar formato básico de URL
    try {
        new URL(url)
    } catch {
        throw new Error(
            `URL malformada: "${url.substring(0, 20)}...". Verifique o formato no .env`
        )
    }

    return url
}

/**
 * Higieniza a chave Anon do Supabase
 */
function sanitizeSupabaseKey(rawKey: string | undefined): string {
    if (!rawKey) {
        throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida')
    }

    // Limpar: remover espaços e aspas
    return rawKey.trim().replace(/['"]/g, '')
}

/**
 * Máscara para log seguro (mostra apenas início)
 */
function maskValue(value: string, showChars: number = 10): string {
    if (value.length <= showChars) return value
    return `${value.substring(0, showChars)}...`
}

export async function createClient() {
    // Next.js 15: cookies() agora é assíncrono
    const cookieStore = await cookies()

    // Pegar e higienizar variáveis de ambiente
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Debug: mostrar valores RAW antes da limpeza
    console.log("🔍 DEBUG ENV (RAW):", {
        URL_RAW: rawUrl ? maskValue(rawUrl) : "MISSING ❌",
        KEY_RAW: rawKey ? maskValue(rawKey) : "MISSING ❌"
    })

    try {
        const supabaseUrl = sanitizeSupabaseUrl(rawUrl)
        const supabaseAnonKey = sanitizeSupabaseKey(rawKey)

        // Debug: mostrar valores LIMPOS
        console.log("✅ DEBUG ENV (SANITIZED):", {
            URL: maskValue(supabaseUrl),
            KEY: maskValue(supabaseAnonKey)
        })

        return createServerClient(supabaseUrl, supabaseAnonKey, {
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
    } catch (error) {
        console.error("❌ ERRO CRÍTICO ao criar cliente Supabase:", error)
        throw error
    }
}
