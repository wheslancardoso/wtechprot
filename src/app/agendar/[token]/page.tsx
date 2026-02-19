'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { getAvailability } from '@/app/actions/schedules/get-availability-action'
import { confirmSchedule } from '@/app/actions/schedules/confirm-schedule-action'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

// ==================================================
// Tipos locais
// ==================================================
type Step = 'loading' | 'selectDate' | 'selectTime' | 'confirm' | 'success' | 'error'

// ==================================================
// Página pública de Agendamento
// ==================================================
export default function AgendarPage() {
    const params = useParams()
    const token = params.token as string

    const [step, setStep] = useState<Step>('loading')
    const [errorMessage, setErrorMessage] = useState('')
    const [availableDates, setAvailableDates] = useState<string[]>([])
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [scheduleInfo, setScheduleInfo] = useState<{
        customerName: string | null
        notes: string | null
        expiresAt: string
    } | null>(null)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [confirming, setConfirming] = useState(false)

    // Paginação do calendário (grupos de 14 datas)
    const [datePageIndex, setDatePageIndex] = useState(0)
    const DATES_PER_PAGE = 14

    // Carregar dados iniciais
    useEffect(() => {
        async function load() {
            const result = await getAvailability(token)
            if (!result.success) {
                setErrorMessage(result.error || 'Link inválido.')
                setStep('error')
                return
            }
            setAvailableDates(result.availableDates ?? [])
            setScheduleInfo(result.scheduleInfo ?? null)
            setStep('selectDate')
        }
        load()
    }, [token])

    // Selecionar data e buscar horários
    const handleSelectDate = useCallback(async (date: string) => {
        setSelectedDate(date)
        setSelectedTime(null)
        setLoadingSlots(true)

        const result = await getAvailability(token, date)
        if (!result.success) {
            setErrorMessage(result.error || 'Erro ao carregar horários.')
            setStep('error')
            return
        }

        setAvailableSlots(result.slots ?? [])
        setLoadingSlots(false)
        setStep('selectTime')
    }, [token])

    // Confirmar agendamento
    const handleConfirm = useCallback(async () => {
        if (!selectedDate || !selectedTime) return

        setConfirming(true)
        const result = await confirmSchedule({
            token,
            selectedDate,
            selectedTime,
        })

        if (!result.success) {
            setErrorMessage(result.error || 'Erro ao confirmar.')
            setConfirming(false)
            setStep('error')
            return
        }

        setStep('success')
        setConfirming(false)
    }, [token, selectedDate, selectedTime])

    // Datas paginadas
    const paginatedDates = availableDates.slice(
        datePageIndex * DATES_PER_PAGE,
        (datePageIndex + 1) * DATES_PER_PAGE
    )
    const totalDatePages = Math.ceil(availableDates.length / DATES_PER_PAGE)

    // ==================================================
    // Render
    // ==================================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">

                {/* Card Principal */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border-b border-gray-800 p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Agendar Visita</h1>
                                <p className="text-sm text-gray-400">
                                    Escolha o melhor dia e horário para você
                                </p>
                            </div>
                        </div>
                        {scheduleInfo?.customerName && (
                            <p className="mt-3 text-sm text-gray-300">
                                Olá, <span className="font-semibold text-emerald-400">{scheduleInfo.customerName.split(' ')[0]}</span>!
                            </p>
                        )}
                    </div>

                    {/* Conteúdo */}
                    <div className="p-6">

                        {/* ===== LOADING ===== */}
                        {step === 'loading' && (
                            <div className="flex flex-col items-center gap-4 py-12">
                                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                <p className="text-gray-400">Carregando disponibilidade...</p>
                            </div>
                        )}

                        {/* ===== ERRO ===== */}
                        {step === 'error' && (
                            <div className="flex flex-col items-center gap-4 py-12 text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-400" />
                                </div>
                                <h2 className="text-lg font-semibold text-white">Ops!</h2>
                                <p className="text-gray-400 max-w-sm">{errorMessage}</p>
                            </div>
                        )}

                        {/* ===== SELECIONAR DATA ===== */}
                        {step === 'selectDate' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        Selecione o dia
                                    </h2>
                                    {totalDatePages > 1 && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setDatePageIndex(p => Math.max(0, p - 1))}
                                                disabled={datePageIndex === 0}
                                                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="text-xs text-gray-500 px-2">
                                                {datePageIndex + 1}/{totalDatePages}
                                            </span>
                                            <button
                                                onClick={() => setDatePageIndex(p => Math.min(totalDatePages - 1, p + 1))}
                                                disabled={datePageIndex === totalDatePages - 1}
                                                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {paginatedDates.map((date) => {
                                        const parsed = parseISO(date)
                                        const dayName = format(parsed, 'EEEE', { locale: ptBR })
                                        const dayNumber = format(parsed, "dd 'de' MMM", { locale: ptBR })
                                        return (
                                            <button
                                                key={date}
                                                onClick={() => handleSelectDate(date)}
                                                className="flex flex-col items-start gap-0.5 p-3 rounded-xl border border-gray-700/50 bg-gray-800/40 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all text-left group"
                                            >
                                                <span className="text-xs text-gray-500 capitalize group-hover:text-emerald-400 transition-colors">
                                                    {dayName}
                                                </span>
                                                <span className="text-sm font-medium text-white capitalize">
                                                    {dayNumber}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>

                                {availableDates.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">
                                        Nenhuma data disponível no momento.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ===== SELECIONAR HORÁRIO ===== */}
                        {step === 'selectTime' && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        setStep('selectDate')
                                        setSelectedDate(null)
                                    }}
                                    className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Voltar
                                </button>

                                {selectedDate && (
                                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                        <Calendar className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm text-emerald-300 capitalize">
                                            {format(parseISO(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                        </span>
                                    </div>
                                )}

                                <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                                    Selecione o horário
                                </h2>

                                {loadingSlots ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">
                                        Nenhum horário disponível neste dia.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {availableSlots.map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => {
                                                    setSelectedTime(time)
                                                    setStep('confirm')
                                                }}
                                                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-700/50 bg-gray-800/40 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all group"
                                            >
                                                <Clock className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                                                <span className="text-sm font-medium text-white">{time}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== CONFIRMAR ===== */}
                        {step === 'confirm' && selectedDate && selectedTime && (
                            <div className="space-y-6">
                                <button
                                    onClick={() => setStep('selectTime')}
                                    className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Voltar
                                </button>

                                <div className="bg-gray-800/60 rounded-2xl p-5 border border-gray-700/40 space-y-4">
                                    <h2 className="text-lg font-semibold text-white text-center">
                                        Confirmar Agendamento
                                    </h2>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 bg-gray-900/60 rounded-xl p-3">
                                            <Calendar className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Data</p>
                                                <p className="text-sm font-medium text-white capitalize">
                                                    {format(parseISO(selectedDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-900/60 rounded-xl p-3">
                                            <Clock className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Horário</p>
                                                <p className="text-sm font-medium text-white">{selectedTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirm}
                                    disabled={confirming}
                                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                                >
                                    {confirming ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Confirmando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Confirmar Agendamento
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* ===== SUCESSO ===== */}
                        {step === 'success' && selectedDate && selectedTime && (
                            <div className="flex flex-col items-center gap-6 py-8 text-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center animate-scale-in">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-white">Agendado com sucesso!</h2>
                                    <p className="text-gray-400">
                                        Sua visita está confirmada para:
                                    </p>
                                </div>
                                <div className="bg-gray-800/60 rounded-2xl p-4 border border-emerald-500/20 w-full max-w-xs space-y-2">
                                    <p className="text-sm text-white capitalize font-medium">
                                        {format(parseISO(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-400">{selectedTime}</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Você pode fechar esta página. O técnico já foi notificado.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-600 mt-4">
                    Powered by WTECH
                </p>
            </div>
        </div>
    )
}
