'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ClipboardList,
    Users,
    BarChart3,
    Settings,
    Home,
    Tags,
    MessageSquare,
    Bell,
    Menu,
    X,
    Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
    { href: '/dashboard', label: 'Início', icon: Home },
    { href: '/dashboard/orders', label: 'Ordens de Serviço', icon: ClipboardList },
    { href: '/dashboard/customers', label: 'Clientes', icon: Users },
    { href: '/dashboard/leads', label: 'Leads B2B', icon: Briefcase },
    { href: '/dashboard/feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { href: '/dashboard/follow-ups', label: 'Follow-ups', icon: Bell },
    { href: '/dashboard/metrics', label: 'Métricas', icon: BarChart3 },
    { href: '/dashboard/services', label: 'Catálogo', icon: Tags },
    { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
]

export function DashboardNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    return (
        <>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Mobile Nav Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 top-14 z-50 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in-0">
                    <div className="bg-background border-b shadow-lg p-4 flex flex-col gap-2 animate-in slide-in-from-top-5">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                    {/* Click outside to close */}
                    <div className="flex-1" onClick={() => setIsOpen(false)} />
                </div>
            )}
        </>
    )
}
