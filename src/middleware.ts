import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Criar response mutável
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Pegar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Se variáveis não existem, deixar passar (vai falhar no server)
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('⚠️ Middleware: Supabase env vars missing')
        return supabaseResponse
    }

    // Criar cliente Supabase com gerenciamento de cookies
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                // Atualizar cookies no request (para server components)
                cookiesToSet.forEach(({ name, value }) => {
                    request.cookies.set(name, value)
                })

                // Criar novo response com cookies atualizados
                supabaseResponse = NextResponse.next({
                    request,
                })

                // Atualizar cookies no response (para o browser)
                cookiesToSet.forEach(({ name, value, options }) => {
                    supabaseResponse.cookies.set(name, value, options)
                })
            },
        },
    })

    // IMPORTANTE: Não usar getSession() - use getUser() para verificar auth
    // getSession() lê do storage local e pode ser manipulado
    // getUser() valida o token com o servidor Supabase
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // ============================================
    // REGRAS DE PROTEÇÃO
    // ============================================

    // 1. Rotas protegidas: /dashboard/*
    const isProtectedRoute = pathname.startsWith('/dashboard')

    // 2. Rotas de auth: /login
    const isAuthRoute = pathname === '/login'

    // 3. Home: /
    const isHome = pathname === '/'

    // Se NÃO está logado e tenta acessar rota protegida -> Login
    if (!user && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname) // Salvar destino original
        return NextResponse.redirect(loginUrl)
    }

    // Se ESTÁ logado e tenta acessar login ou home -> Dashboard
    if (user && (isAuthRoute || isHome)) {
        return NextResponse.redirect(new URL('/dashboard/orders', request.url))
    }

    return supabaseResponse
}

// ============================================
// MATCHER: Onde o middleware é aplicado
// ============================================
export const config = {
    matcher: [
        /*
         * Match em todas as rotas EXCETO:
         * - _next/static (arquivos estáticos)
         * - _next/image (otimização de imagens)
         * - favicon.ico (favicon)
         * - Arquivos com extensão (imagens, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
