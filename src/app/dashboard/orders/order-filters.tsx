'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'

// UI Components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// Icons
import { Search, X, Filter, Loader2 } from 'lucide-react'

// ==================================================
// Status Options
// ==================================================
// Dot color map for each status (avoids emoji — screen reader safe)
const STATUS_DOT: Record<string, string> = {
    open: 'bg-blue-400',
    analyzing: 'bg-yellow-400',
    waiting_approval: 'bg-orange-400',
    waiting_parts: 'bg-purple-400',
    in_progress: 'bg-blue-500',
    ready: 'bg-green-400',
    finished: 'bg-emerald-500',
    canceled: 'bg-red-500',
}

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos os Status', dot: null },
    { value: 'open', label: 'Abertas', dot: STATUS_DOT.open },
    { value: 'analyzing', label: 'Em Análise', dot: STATUS_DOT.analyzing },
    { value: 'waiting_approval', label: 'Aguardando Aprovação', dot: STATUS_DOT.waiting_approval },
    { value: 'waiting_parts', label: 'Aguardando Peças', dot: STATUS_DOT.waiting_parts },
    { value: 'in_progress', label: 'Em Reparo', dot: STATUS_DOT.in_progress },
    { value: 'ready', label: 'Prontas', dot: STATUS_DOT.ready },
    { value: 'finished', label: 'Finalizadas', dot: STATUS_DOT.finished },
    { value: 'canceled', label: 'Canceladas', dot: STATUS_DOT.canceled },
]

// ==================================================
// Period Options
// ==================================================
const PERIOD_OPTIONS = [
    { value: 'all', label: 'Qualquer período' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: 'month', label: 'Este mês' },
]

// ==================================================
// Component
// ==================================================
export default function OrderFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Estados locais sincronizados com URL
    const [search, setSearch] = useState(searchParams.get('q') || '')
    const [status, setStatus] = useState(searchParams.get('status') || 'all')
    const [period, setPeriod] = useState(searchParams.get('period') || 'all')

    // Atualizar URL com os filtros
    const updateFilters = useCallback((newParams: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(newParams).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        startTransition(() => {
            router.push(`/dashboard/orders?${params.toString()}`)
        })
    }, [router, searchParams])

    // Handlers
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateFilters({ q: search, status, period })
    }

    const handleStatusChange = (value: string) => {
        setStatus(value)
        updateFilters({ q: search, status: value, period })
    }

    const handlePeriodChange = (value: string) => {
        setPeriod(value)
        updateFilters({ q: search, status, period: value })
    }

    const handleClearFilters = () => {
        setSearch('')
        setStatus('all')
        setPeriod('all')
        router.push('/dashboard/orders')
    }

    const hasFilters = search || status !== 'all' || period !== 'all'

    return (
        <div className="bg-card border rounded-lg p-4 space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar por nome, CPF ou número da OS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                </Button>
            </form>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-stretch sm:items-center">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filtros:</span>
                </div>

                {/* Status Filter */}
                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                <span className="flex items-center gap-2">
                                    {opt.dot && (
                                        <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${opt.dot}`} aria-hidden="true" />
                                    )}
                                    {opt.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Period Filter */}
                <Select value={period} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        {PERIOD_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Clear Filters */}
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Limpar
                    </Button>
                )}

                {/* Loading Indicator */}
                {isPending && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Buscando...
                    </span>
                )}
            </div>
        </div>
    )
}
