import { SettingsProvider } from '@/components/settings-provider'
import Link from 'next/link'
import { Metadata } from 'next'
import { getSettings } from '@/app/dashboard/settings/actions'
import {

    Bell,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'

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
                    <div className="container mx-auto flex h-14 items-center justify-between px-4">
                        {/* Logo */}
                        <Link href="/dashboard" className="font-bold text-lg mr-8 truncate max-w-[200px] text-primary">
                            {brandName}
                        </Link>

                        {/* Navigation */}
                        <DashboardNav />
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
