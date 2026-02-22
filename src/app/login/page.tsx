'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { login } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Terminal, Cpu, Shield, Wifi } from 'lucide-react'

// ==================================================
// Decorative tech badge
// ==================================================
function TechBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-2 text-xs text-primary/60 font-mono">
            <Icon className="h-3 w-3 text-primary/40" />
            <span>{label}</span>
        </div>
    )
}

// ==================================================
// Animated dot grid background
// ==================================================
function DotGrid() {
    return (
        <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
                backgroundImage: `radial-gradient(circle, hsl(150 100% 50%) 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
            }}
        />
    )
}

// ==================================================
// Corner brackets decorative element
// ==================================================
function CornerBrackets() {
    const bracketClass = "absolute w-4 h-4 border-primary/40"
    return (
        <>
            <span className={`${bracketClass} top-0 left-0 border-t-2 border-l-2`} />
            <span className={`${bracketClass} top-0 right-0 border-t-2 border-r-2`} />
            <span className={`${bracketClass} bottom-0 left-0 border-b-2 border-l-2`} />
            <span className={`${bracketClass} bottom-0 right-0 border-b-2 border-r-2`} />
        </>
    )
}

// ==================================================
// Login Page
// ==================================================
export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)

        try {
            const result = await login(formData)

            if (result.success) {
                router.push('/dashboard')
                router.refresh()
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('Erro inesperado. Tente novamente.')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex bg-[#0D0D0D] overflow-hidden">
            {/* Global dot grid */}
            <DotGrid />

            {/* Neon ambient glow — top-left */}
            <div
                className="absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, hsl(150 100% 50% / 0.07) 0%, transparent 70%)' }}
            />
            {/* Neon ambient glow — bottom-right */}
            <div
                className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, hsl(150 100% 50% / 0.05) 0%, transparent 70%)' }}
            />

            {/* ======================================================
                LEFT PANEL — Brand & Tech Identity (hidden on mobile)
                ====================================================== */}
            <div className="hidden lg:flex flex-col justify-between flex-1 p-12 relative">
                {/* Logo */}
                <div className="flex items-center gap-3 animate-fade-in">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo.svg"
                        alt="WFIX Tech"
                        className="h-10 w-10 object-contain"
                        style={{ filter: 'drop-shadow(0 0 8px hsl(150 100% 50% / 0.6))' }}
                    />
                    <div className="font-mono">
                        <span className="text-lg font-bold text-primary tracking-widest">WFIX</span>
                        <span className="text-lg font-light text-foreground/50 ml-1.5">Tech</span>
                    </div>
                </div>

                {/* Central brand statement */}
                <div className="space-y-6 animate-fade-in-up" style={{ '--stagger': '100ms' } as React.CSSProperties}>
                    {/* System label */}
                    <div className="flex items-center gap-2">
                        <span className="h-px w-8 bg-primary/40" />
                        <span className="text-xs font-mono text-primary/60 uppercase tracking-widest">Sistema de Gestão</span>
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                        Gestão completa
                        <br />
                        para sua{' '}
                        <span
                            className="text-primary"
                            style={{ textShadow: '0 0 24px hsl(150 100% 50% / 0.5)' }}
                        >
                            assistência técnica
                        </span>
                    </h1>

                    <p className="text-muted-foreground text-base max-w-sm leading-relaxed">
                        Ordens de serviço, agenda de clientes, follow-ups automáticos e métricas em tempo real.
                    </p>

                    {/* Tech badges */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <TechBadge icon={Shield} label="Dados criptografados" />
                        <TechBadge icon={Wifi} label="Sync em tempo real" />
                        <TechBadge icon={Cpu} label="IA integrada" />
                        <TechBadge icon={Terminal} label="Multi-tenant SaaS" />
                    </div>
                </div>

                {/* Bottom: version / env indicator */}
                <div className="flex items-center gap-3 font-mono">
                    <span className="inline-flex items-center gap-1.5 text-xs text-primary/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-subtle-pulse" />
                        SISTEMA ONLINE
                    </span>
                    <span className="text-xs text-muted-foreground/40">v2.0</span>
                </div>
            </div>

            {/* Vertical divider */}
            <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent self-stretch" />

            {/* ======================================================
                RIGHT PANEL — Login Form
                ====================================================== */}
            <div className="flex flex-col justify-center w-full lg:w-[480px] xl:w-[520px] shrink-0 px-6 py-12 lg:px-14 relative">

                {/* Mobile-only logo */}
                <div className="flex items-center gap-3 mb-10 lg:hidden animate-fade-in">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo.svg"
                        alt="WFIX Tech"
                        className="h-9 w-9 object-contain"
                        style={{ filter: 'drop-shadow(0 0 8px hsl(150 100% 50% / 0.6))' }}
                    />
                    <span className="font-mono text-base font-bold text-primary tracking-widest">WFIX</span>
                    <span className="font-mono text-base font-light text-foreground/50">Tech</span>
                </div>

                {/* Form card */}
                <div
                    className="relative p-8 rounded-2xl border border-primary/15 bg-white/[0.02] backdrop-blur-sm animate-scale-in"
                    style={{ boxShadow: '0 0 40px hsl(150 100% 50% / 0.06), inset 0 1px 0 hsl(150 100% 50% / 0.08)' }}
                >
                    <CornerBrackets />

                    {/* Card header */}
                    <div className="mb-8">
                        <p className="text-xs font-mono text-primary/50 uppercase tracking-widest mb-2">
                            // acesso restrito
                        </p>
                        <h2 className="text-2xl font-bold tracking-tight">Entrar na plataforma</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Insira suas credenciais para continuar
                        </p>
                    </div>

                    {/* Error alert */}
                    {error && (
                        <Alert variant="destructive" className="mb-6 border-red-500/30 bg-red-500/10">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                disabled={isLoading}
                                autoComplete="email"
                                className="bg-white/[0.03] border-border/60 focus:border-primary/60 h-11 font-mono text-sm placeholder:text-muted-foreground/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                                    Senha
                                </Label>
                                <Link
                                    href="#"
                                    className="text-xs text-primary/60 hover:text-primary transition-colors font-mono"
                                >
                                    Esqueceu?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                autoComplete="current-password"
                                className="bg-white/[0.03] border-border/60 focus:border-primary/60 h-11 font-mono text-sm placeholder:text-muted-foreground/40"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 font-semibold text-sm tracking-wider mt-2 transition-all duration-200"
                            disabled={isLoading}
                            style={{
                                boxShadow: isLoading ? 'none' : '0 0 20px hsl(150 100% 50% / 0.3)',
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Autenticando...
                                </>
                            ) : (
                                'Acessar Sistema'
                            )}
                        </Button>
                    </form>

                    {/* Divider + signup */}
                    <div className="mt-6 pt-6 border-t border-border/30 text-center">
                        <p className="text-sm text-muted-foreground">
                            Ainda não tem conta?{' '}
                            <Link
                                href="/signup"
                                className="font-semibold text-primary hover:underline underline-offset-4"
                            >
                                Criar conta grátis
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-muted-foreground/40 font-mono">
                    WFIX Tech SaaS &copy; {new Date().getFullYear()} &mdash; Todos os direitos reservados
                </p>
            </div>
        </div>
    )
}
