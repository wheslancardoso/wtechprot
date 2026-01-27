'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Server Action (será criada a seguir)
import { login } from './actions'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Icons
import { Loader2, Wrench, AlertCircle } from 'lucide-react'

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-4">
                    {/* Logo / Ícone */}
                    <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                        <Wrench className="w-8 h-8 text-primary-foreground" />
                    </div>

                    <div>
                        <CardTitle className="text-2xl font-bold">Acessar WTECH</CardTitle>
                        <CardDescription>
                            Sistema de Gestão para Assistência Técnica
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

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                autoComplete="current-password"
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
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Esqueceu sua senha?
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        Ainda não tem conta?{' '}
                        <Link
                            href="/signup"
                            className="font-medium text-primary hover:underline"
                        >
                            Cadastre-se
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
