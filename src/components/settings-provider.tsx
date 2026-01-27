'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getSettings, type TenantSettings } from '@/app/dashboard/settings/actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Settings, Loader2 } from 'lucide-react'
import Link from 'next/link'

// ==================================================
// Contexto de Settings (para compartilhar entre componentes)
// ==================================================
import { createContext, useContext } from 'react'

interface SettingsContextType {
    settings: TenantSettings | null
    loading: boolean
    isComplete: boolean
    refresh: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    loading: true,
    isComplete: false,
    refresh: async () => { },
})

export function useSettings() {
    return useContext(SettingsContext)
}

// ==================================================
// Verificar se configurações estão completas
// ==================================================
function checkSettingsComplete(settings: TenantSettings | null): boolean {
    if (!settings) return false

    // Verifica campos mínimos para validade jurídica
    const hasName = !!settings.trade_name && settings.trade_name !== 'Minha Assistência'
    const hasDocument = !!settings.legal_document
    const hasAddress = !!settings.address?.city

    return hasName && hasDocument && hasAddress
}

// ==================================================
// Provider de Settings
// ==================================================
interface SettingsProviderProps {
    children: React.ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState<TenantSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()
    const router = useRouter()

    const loadSettings = async () => {
        setLoading(true)
        const result = await getSettings()
        if (result.success && result.data) {
            setSettings(result.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadSettings()
    }, [])

    // Verificar se está completo
    const isComplete = checkSettingsComplete(settings)

    // Páginas que não precisam de onboarding
    const exemptPaths = ['/dashboard/settings', '/login', '/']
    const isExempt = exemptPaths.some(p => pathname === p)

    // Se carregando, não fazer nada ainda
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Se não está completo e não está na página de settings, mostrar alerta
    const showOnboardingAlert = !isComplete && !isExempt

    return (
        <SettingsContext.Provider value={{ settings, loading, isComplete, refresh: loadSettings }}>
            {showOnboardingAlert && (
                <div className="sticky top-0 z-50 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 p-4">
                    <Alert className="max-w-4xl mx-auto border-amber-300 dark:border-amber-700">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800 dark:text-amber-200">
                            Complete seu cadastro
                        </AlertTitle>
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                            Para emitir Ordens de Serviço com validade jurídica, configure o nome, CNPJ e endereço da sua loja.
                            <Button asChild variant="outline" size="sm" className="ml-4">
                                <Link href="/dashboard/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Configurar Agora
                                </Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
            {children}
        </SettingsContext.Provider>
    )
}

// ==================================================
// HOC para bloquear criação de OS sem settings
// ==================================================
interface RequireSettingsProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function RequireSettings({ children, fallback }: RequireSettingsProps) {
    const { isComplete, loading } = useSettings()

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!isComplete) {
        return fallback || (
            <div className="container mx-auto py-16 px-4">
                <div className="max-w-md mx-auto text-center">
                    <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Configuração Incompleta</h2>
                    <p className="text-muted-foreground mb-6">
                        Para criar Ordens de Serviço com validade jurídica, você precisa completar
                        o cadastro da sua loja com nome, CNPJ e endereço.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Ir para Configurações
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
