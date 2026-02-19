export function formatOrderId(displayId: number | string, date?: string | Date): string {
    const val = String(displayId)

    // Se já estiver no formato correto (YYYYWF-XXXX), retorne
    if (/^\d{4}WF-\d+$/.test(val)) return val

    // Se vier com prefixo duplicado ou sujeira, limpa tudo exceto números do ID
    // Ex: "2026WF-2026WF-0010" -> "0010" (pega o último grupo de números)
    // Mas cuidado: se for apenas o numero "10", ok.
    // Se for "2026WF-10", ok.

    // Melhora: Tenta extrair o ID numérico final se possível
    const match = val.match(/(\d+)$/)
    const cleanId = match ? match[1] : val.replace(/\D/g, '')

    const year = date ? new Date(date).getFullYear() : new Date().getFullYear()
    return `${year}WF-${cleanId.padStart(4, '0')}`
}

export function parseOrderId(id: string): number | null {
    // Tenta extrair o ID numérico do formato YYYYWF-XXXX
    const match = id.match(/(\d{4})WF-(\d+)/)
    if (match && match[2]) {
        return parseInt(match[2], 10)
    }

    // Se for apenas número
    if (/^\d+$/.test(id)) {
        return parseInt(id, 10)
    }

    return null
}

export function isUuid(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}
