import { SettingsProvider } from '@/components/settings-provider'
import Link from 'next/link'
import { Metadata } from 'next'
import { getSettings } from '@/app/dashboard/settings/actions'
import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardPageTransition } from '@/components/dashboard-page-transition'

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
                        <Link href="/dashboard" className="mr-8 shrink-0 flex items-center" aria-label="WFIX Tech - Início">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.svg" alt="WFIX Tech" className="h-8 w-8 object-contain" />
                            <span className="ml-2 font-bold text-base text-primary hidden sm:block truncate max-w-[140px]">
                                {brandName}
                            </span>
                        </Link>

                        {/* Navigation */}
                        <DashboardNav />
                    </div>
                </header>

                {/* Main Content */}
                <main className="min-h-[calc(100vh-3.5rem)]">
                    <DashboardPageTransition>
                        {children}
                    </DashboardPageTransition>
                </main>
            </div>
        </SettingsProvider>
    )
}
