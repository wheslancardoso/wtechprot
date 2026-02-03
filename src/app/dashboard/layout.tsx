import { SettingsProvider } from '@/components/settings-provider'
import Link from 'next/link'
import { Metadata } from 'next'
import { getSettings } from '@/app/dashboard/settings/actions'
import {
    ClipboardList,
    Users,
    BarChart3,
    Settings,
    Home,
    Tags,
    MessageSquare,
    Bell,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// ==================================================
// Metadata Dinâmico (Nome da Loja)
// ==================================================
export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings()

    if (settings.success && settings.data?.trade_name) {
        return {
            title: {
                template: `%s | ${settings.data.trade_name}`,
                default: settings.data.trade_name,
            },
        }
    }

    return {
        title: 'Dashboard',
    }
}

// ==================================================
// Menu Items
// ==================================================
const menuItems = [
    { href: '/dashboard', label: 'Início', icon: Home },
    { href: '/dashboard/orders', label: 'Ordens de Serviço', icon: ClipboardList },
    { href: '/dashboard/customers', label: 'Clientes', icon: Users },
    { href: '/dashboard/feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { href: '/dashboard/follow-ups', label: 'Follow-ups', icon: Bell },
    { href: '/dashboard/metrics', label: 'Métricas', icon: BarChart3 },
    { href: '/dashboard/services', label: 'Catálogo', icon: Tags },
    { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
]

// ==================================================
// Layout
// ==================================================
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const settings = await getSettings()
    const brandName = settings.success && settings.data?.trade_name
        ? settings.data.trade_name.toUpperCase()
        : 'WTECH'

    return (
        <SettingsProvider>
            <div className="min-h-screen bg-background">
                {/* Top Navigation */}
                <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto flex h-14 items-center px-4">
                        {/* Logo */}
                        <Link href="/dashboard" className="font-bold text-lg mr-8 truncate max-w-[200px]">
                            {brandName}
                        </Link>

                        {/* Navigation */}
                        <nav className="flex items-center gap-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden md:inline">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="min-h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
            </div>
        </SettingsProvider>
    )
}
