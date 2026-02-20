'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Server Action
import { signup } from './actions'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Icons
import { Loader2, Wrench, AlertCircle, CheckCircle, Mail } from 'lucide-react'

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<{ message: string; needsEmail: boolean } | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        const formData = new FormData(event.currentTarget)

        try {
            const result = await signup(formData)

            if (result.success) {
                if (result.needsEmailConfirmation) {
                    setSuccess({
                        message: result.message,
                        needsEmail: true,
                    })
                } else {
                    setSuccess({
                        message: result.message,
                        needsEmail: false,
                    })
                    // Redirecionar para dashboard (o middleware vai cuidar do onboarding)
                    setTimeout(() => {
                        router.push('/dashboard')
                        router.refresh()
                    }, 1500)
                }
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-4">
                    {/* Logo / Ícone */}
                    <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                        <Wrench className="w-8 h-8 text-primary-foreground" />
                    </div>

                    <div>
                        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                        <CardDescription>
                            Cadastre-se para gerenciar sua central de operações
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Mensagem de Erro */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Mensagem de Sucesso */}
                    {success && (
                        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
                            {success.needsEmail ? (
                                <Mail className="h-4 w-4 text-green-600" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            <AlertDescription className="text-green-700 dark:text-green-300">
                                {success.message}
                                {success.needsEmail && (
                                    <p className="mt-2 text-sm">
                                        Verifique sua caixa de entrada e spam.
                                    </p>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nome */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Seu nome"
                                    required
                                    disabled={isLoading}
                                    autoComplete="name"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                    minLength={6}
                                />
                            </div>

                            {/* Confirmar Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                    minLength={6}
                                />
                            </div>

                            {/* Botão Submit */}
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    'Criar Conta'
                                )}
                            </Button>
                        </form>
                    )}

                    {success?.needsEmail && (
                        <div className="mt-4 text-center">
                            <Button variant="outline" asChild>
                                <Link href="/login">Ir para Login</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Já tem uma conta?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Fazer Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>

            {/* Footer discreto */}
            <p className="absolute bottom-4 text-xs text-muted-foreground">
                WTECH SaaS © {new Date().getFullYear()}
            </p>
        </div>
    )
}
