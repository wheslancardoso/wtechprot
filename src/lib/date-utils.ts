import { format } from 'date-fns'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

// Timezone padrão do Brasil
const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

/**
 * Converte uma data UTC para horário de Brasília e formata
 * @param date - Data em UTC (string ISO ou Date)
 * @param formatStr - Formato de saída (padrão: "dd/MM/yyyy 'às' HH:mm")
 * @returns String formatada no horário de Brasília
 */
export function formatDateToLocal(
    date: string | Date | null | undefined,
    formatStr: string = "dd/MM/yyyy 'às' HH:mm"
): string {
    if (!date) return '—'

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date

        // Converter para timezone de São Paulo
        return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, formatStr, { locale: ptBR })
    } catch (error) {
        console.error('Erro ao formatar data:', error)
        return '—'
    }
}

/**
 * Formata data curta (sem hora)
 */
export function formatDateShort(date: string | Date | null | undefined): string {
    return formatDateToLocal(date, 'dd/MM/yyyy')
}

/**
 * Formata apenas hora
 */
export function formatTime(date: string | Date | null | undefined): string {
    return formatDateToLocal(date, 'HH:mm')
}

/**
 * Formata data completa para documentos
 */
export function formatDateFull(date: string | Date | null | undefined): string {
    return formatDateToLocal(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm")
}

/**
 * Formata data relativa (ex: "há 2 horas")
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
    if (!date) return '—'

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date
        const now = new Date()
        const diffMs = now.getTime() - dateObj.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'agora'
        if (diffMins < 60) return `há ${diffMins} min`
        if (diffHours < 24) return `há ${diffHours}h`
        if (diffDays < 7) return `há ${diffDays} dia(s)`

        return formatDateShort(date)
    } catch {
        return '—'
    }
}

/**
 * Converte data local para UTC (para salvar no banco)
 */
export function toUTC(date: Date): Date {
    return new Date(date.toISOString())
}

/**
 * Retorna o início do mês atual (para queries)
 */
export function getStartOfMonth(): string {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return start.toISOString()
}

/**
 * Retorna o início da semana atual (para queries)
 */
export function getStartOfWeek(): string {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Ajusta para começar segunda
    const start = new Date(now.setDate(diff))
    start.setHours(0, 0, 0, 0)
    return start.toISOString()
}

/**
 * Retorna data de N dias atrás
 */
export function getDaysAgo(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    date.setHours(0, 0, 0, 0)
    return date.toISOString()
}
