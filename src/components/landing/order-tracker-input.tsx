'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function OrderTrackerInput() {
    const router = useRouter()
    const [orderId, setOrderId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        const cleanId = orderId.trim()

        if (!cleanId) {
            setError('Por favor, digite o número da OS.')
            return
        }

        // Validação básica de tamanho (UUID ou Smart ID)
        if (cleanId.length < 4) {
            setError('ID inválido. Verifique o número digitado.')
            return
        }

        setIsLoading(true)

        // Simular um pequeno delay para feedback visual
        // O redirecionamento real faz a busca
        await new Promise(resolve => setTimeout(resolve, 600))

        router.push(`/os/${cleanId}/track`)
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2 relative">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Digite o número da sua OS..."
                        className="pl-9 h-12 bg-background/50 border-input backdrop-blur-sm text-lg"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                    />
                </div>
                <Button type="submit" size="lg" className="h-12 px-6 font-semibold shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Rastrear
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                    )}
                </Button>
            </form>

            {error && (
                <Alert variant="destructive" className="py-2 animate-in fade-in slide-in-from-top-1">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}
