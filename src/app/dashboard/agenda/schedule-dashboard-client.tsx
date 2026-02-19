'use client'

import { useState, useTransition, useEffect } from 'react'
import { format, parseISO, isAfter, isBefore, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Schedule, ScheduleSettings } from '@/types/database'
import { generateScheduleLink } from '@/app/actions/schedules/generate-link-action'
import { cancelSchedule, saveScheduleSettings } from '@/app/actions/schedules/schedule-actions'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import {
    Calendar,
    Clock,
    Plus,
    Copy,
    Check,
    X,
    Settings,
    ChevronRight,
    Link2,
    AlertCircle,
    Loader2,
    CalendarCheck,
    CalendarX,
    CalendarClock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ==================================================
// Props
// ==================================================
interface ScheduleDashboardClientProps {
    initialSchedules: Schedule[]
    initialSettings: ScheduleSettings | null
}

// ==================================================
// Componente Principal
// ==================================================
export function ScheduleDashboardClient({
    initialSchedules,
    initialSettings,
}: ScheduleDashboardClientProps) {
    const [schedules, setSchedules] = useState(initialSchedules)
    const [settings, setSettings] = useState(initialSettings)
    const [showSettings, setShowSettings] = useState(false)
    const [generatedLink, setGeneratedLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const supabase = createClient()

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('schedules-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'schedules',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setSchedules((prev) => [...prev, payload.new as Schedule])
                    } else if (payload.eventType === 'UPDATE') {
                        setSchedules((prev) =>
                            prev.map((s) => (s.id === payload.new.id ? (payload.new as Schedule) : s))
                        )
                        if (payload.new.status === 'confirmed') {
                            toast({
                                title: 'Novo agendamento!',
                                description: 'Um cliente confirmou um agendamento agora.',
                            })
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setSchedules((prev) => prev.filter((s) => s.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, toast])

    // Tab: upcoming | past | all
    const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming')

    const today = startOfToday()

    const filteredSchedules = schedules.filter((s) => {
        if (tab === 'all') return true
        if (!s.scheduled_date) return tab === 'upcoming'
        const date = parseISO(s.scheduled_date)
        return tab === 'upcoming' ? isAfter(date, today) || format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') : isBefore(date, today)
    })

    // Status badge
    function statusBadge(status: string) {
        const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            pending: {
                label: 'Aguardando',
                className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                icon: <CalendarClock className="w-3.5 h-3.5" />,
            },
            confirmed: {
                label: 'Confirmado',
                className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                icon: <CalendarCheck className="w-3.5 h-3.5" />,
            },
            canceled: {
                label: 'Cancelado',
                className: 'bg-red-500/10 text-red-400 border-red-500/20',
                icon: <CalendarX className="w-3.5 h-3.5" />,
            },
            expired: {
                label: 'Expirado',
                className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
                icon: <AlertCircle className="w-3.5 h-3.5" />,
            },
        }
        const s = map[status] ?? map.pending
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${s.className}`}>
                {s.icon} {s.label}
            </span>
        )
    }

    // Gerar novo link
    async function handleGenerateLink() {
        startTransition(async () => {
            const result = await generateScheduleLink({})
            if (result.success && result.link) {
                setGeneratedLink(result.link)
                toast({ title: 'Link gerado!', description: 'Copie e envie ao cliente.' })
            } else {
                toast({ title: 'Erro', description: result.error, variant: 'destructive' })
            }
        })
    }

    // Copiar link
    async function handleCopy() {
        if (!generatedLink) return
        await navigator.clipboard.writeText(generatedLink)
        setCopied(true)
        toast({ title: 'Link copiado!' })
        setTimeout(() => setCopied(false), 2000)
    }

    // Cancelar agendamento
    async function handleCancel(id: string) {
        startTransition(async () => {
            const result = await cancelSchedule(id)
            if (result.success) {
                setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 'canceled' as const } : s))
                toast({ title: 'Agendamento cancelado.' })
            } else {
                toast({ title: 'Erro', description: result.error, variant: 'destructive' })
            }
        })
    }

    // Contadores
    const confirmedCount = schedules.filter(s => s.status === 'confirmed').length
    const pendingCount = schedules.filter(s => s.status === 'pending').length

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl space-y-4 sm:space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        Agenda
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                        Gerencie seus agendamentos e gere links exclusivos
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Configurações"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={handleGenerateLink}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        Gerar Link
                    </Button>
                </div>
            </div>

            {/* Link Gerado */}
            {generatedLink && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-4 animate-fade-in-up">
                    <Link2 className="w-5 h-5 text-primary shrink-0" />
                    <input
                        readOnly
                        value={generatedLink}
                        className="flex-1 bg-transparent text-sm text-foreground outline-none min-w-0 truncate"
                    />
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setGeneratedLink(null)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Configurações Inline */}
            {showSettings && (
                <SettingsPanel
                    settings={settings}
                    onSave={(newSettings) => {
                        setSettings(prev => prev ? { ...prev, ...newSettings } : null)
                        setShowSettings(false)
                    }}
                />
            )}

            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-card border rounded-xl p-3 sm:p-4 card-hover col-span-2 sm:col-span-1">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{schedules.length}</p>
                </div>
                <div className="bg-card border rounded-xl p-3 sm:p-4 card-hover">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Confirmados</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-500 mt-1">{confirmedCount}</p>
                </div>
                <div className="bg-card border rounded-xl p-3 sm:p-4 card-hover">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Aguardando</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-500 mt-1">{pendingCount}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b">
                {(['upcoming', 'past', 'all'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {t === 'upcoming' ? 'Próximos' : t === 'past' ? 'Anteriores' : 'Todos'}
                    </button>
                ))}
            </div>

            {/* Lista de Agendamentos */}
            <div className="space-y-2">
                {filteredSchedules.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhum agendamento encontrado.</p>
                    </div>
                ) : (
                    filteredSchedules.map((schedule) => (
                        <div
                            key={schedule.id}
                            className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 card-hover"
                        >
                            <div className="flex flex-col sm:flex-row items-start gap-3 min-w-0 w-full sm:w-auto">
                                <div className="flex items-start gap-3 w-full sm:w-auto">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                                            {schedule.customer_name && (
                                                <span className="text-sm font-medium text-foreground truncate block">
                                                    {schedule.customer_name}
                                                </span>
                                            )}
                                            <div className="self-start sm:self-auto">
                                                {statusBadge(schedule.status)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5 sm:mt-1 text-xs text-muted-foreground">
                                            {schedule.scheduled_date && (
                                                <span className="flex items-center gap-1 capitalize">
                                                    <Calendar className="w-3 h-3 shrink-0" />
                                                    {format(parseISO(schedule.scheduled_date), "dd 'de' MMM, EEEE", { locale: ptBR })}
                                                </span>
                                            )}
                                            {schedule.scheduled_time && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 shrink-0" />
                                                    {schedule.scheduled_time.substring(0, 5)}
                                                </span>
                                            )}
                                        </div>
                                        {!schedule.scheduled_date && (
                                            <p className="text-xs text-yellow-400 mt-1">
                                                Link enviado, aguardando cliente
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {(schedule.status === 'pending' || schedule.status === 'confirmed') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancel(schedule.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

// ==================================================
// Painel de Configurações
// ==================================================
function SettingsPanel({
    settings,
    onSave,
}: {
    settings: ScheduleSettings | null
    onSave: (s: Partial<ScheduleSettings>) => void
}) {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    const [workDays, setWorkDays] = useState<number[]>(settings?.work_days ?? [1, 2, 3, 4, 5])
    const [startTime, setStartTime] = useState(settings?.start_time?.substring(0, 5) ?? '09:00')
    const [endTime, setEndTime] = useState(settings?.end_time?.substring(0, 5) ?? '18:00')
    const [slotDuration, setSlotDuration] = useState(settings?.slot_duration_minutes ?? 60)
    const [lunchStart, setLunchStart] = useState(settings?.lunch_start?.substring(0, 5) ?? '12:00')
    const [lunchEnd, setLunchEnd] = useState(settings?.lunch_end?.substring(0, 5) ?? '13:00')
    const [tokenExpiry, setTokenExpiry] = useState(settings?.token_expiry_hours ?? 48)

    function toggleDay(day: number) {
        setWorkDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
        )
    }

    function handleSave() {
        startTransition(async () => {
            const result = await saveScheduleSettings({
                work_days: workDays,
                start_time: startTime,
                end_time: endTime,
                slot_duration_minutes: slotDuration,
                lunch_start: lunchStart,
                lunch_end: lunchEnd,
                token_expiry_hours: tokenExpiry,
            })
            if (result.success) {
                toast({ title: 'Configurações salvas!' })
                onSave({
                    work_days: workDays,
                    start_time: startTime,
                    end_time: endTime,
                    slot_duration_minutes: slotDuration,
                    lunch_start: lunchStart,
                    lunch_end: lunchEnd,
                    token_expiry_hours: tokenExpiry,
                })
            } else {
                toast({ title: 'Erro', description: result.error, variant: 'destructive' })
            }
        })
    }

    return (
        <div className="bg-card border rounded-xl p-5 space-y-5 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Configurações de Horário
            </h3>

            {/* Dias da semana */}
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Dias de atendimento</label>
                <div className="flex gap-1.5">
                    {dayLabels.map((label, idx) => (
                        <button
                            key={idx}
                            onClick={() => toggleDay(idx)}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${workDays.includes(idx)
                                ? 'bg-primary/10 border-primary/40 text-primary'
                                : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/60'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Início</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background border rounded-lg"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Fim</label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background border rounded-lg"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Almoço (início)</label>
                    <input
                        type="time"
                        value={lunchStart}
                        onChange={e => setLunchStart(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background border rounded-lg"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Almoço (fim)</label>
                    <input
                        type="time"
                        value={lunchEnd}
                        onChange={e => setLunchEnd(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background border rounded-lg"
                    />
                </div>
            </div>

            {/* Slot + Validade */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Duração do slot (min)</label>
                    <input
                        type="number"
                        min={15}
                        max={180}
                        step={15}
                        value={slotDuration}
                        onChange={e => setSlotDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-background border rounded-lg"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Validade do link (horas)</label>
                    <input
                        type="number"
                        min={1}
                        max={168}
                        value={tokenExpiry}
                        onChange={e => setTokenExpiry(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-background border rounded-lg"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button size="sm" onClick={handleSave} disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Check className="w-4 h-4 mr-2" />
                    )}
                    Salvar Configurações
                </Button>
            </div>
        </div>
    )
}
