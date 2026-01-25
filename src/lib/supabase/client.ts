import { createBrowserClient } from '@supabase/ssr'

// Verificação de segurança para variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '❌ Missing Environment Variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are not defined. ' +
        'Please check your .env.local file.'
    )
}

// Cliente sem tipagem genérica para evitar erros de compilação
// Tipagem será aplicada manualmente nas queries quando necessário
export function createClient() {
    return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}
