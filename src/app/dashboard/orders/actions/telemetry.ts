'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TelemetryInsert, TelemetrySource } from '@/types/telemetry'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

interface ParseResult {
    source: TelemetrySource
    success: boolean
    data?: Partial<TelemetryInsert>
    error?: string
}

// ----------------------------------------------------------------------
// PARSERS (Enhanced)
// ----------------------------------------------------------------------

async function parseWithAI(content: string): Promise<ParseResult> {
    try {
        console.log("🤖 Iniciando Telemetry AI Parse...")
        if (!process.env.OPENAI_API_KEY) {
            console.warn("⚠️ API Key da OpenAI não encontrada.")
            return { source: 'manual', success: false, error: 'IA não configurada' }
        }

        // Truncate content specifically for AI to avoid token limits if log is huge
        // Keep first 15k chars which usually contain the header/summary
        const truncatedContent = content.slice(0, 15000)

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `
                    Você é um especialista em Hardware Parser. Sua missão é ler logs técnicos (HWiNFO, CrystalDiskInfo, HWMonitor, etc) e extrair dados estruturados JSON.
                    
                    Extraia os seguintes campos (se disponíveis):
                    - source_type: 'hwinfo' | 'crystaldisk' | 'manual' (infira pelo conteúdo)
                    - ssd_health_percent: Saúde do SSD/HD (0-100) (Use 'Drive Remaining Life' ou 'Health Status')
                    - ssd_tbw: Total Bytes Written (em TB). Se estiver em GB, converta.
                    - cpu_temp_max: Temperatura MÁXIMA registrada da CPU (°C). (Procure por 'Maximum', 'Max', 'Peak' em 'CPU Package' ou 'Core Max')
                    - battery_wear_level: Nível de desgaste da bateria (%) (Wear Level / Battery Health invertido se necessário - queremos o 'Wear', ou seja, quanto ja desgastou. Se o log der 'Health 80%', então Wear é 20%).
                    - battery_cycles: Contagem de ciclos da bateria.
                    - cpu_model: Nome completo do processador (Ex: Intel Core i7-12700H).
                    - motherboard_model: Modelo da placa mãe.
                    - ram_total_gb: Total de memória RAM instalada (em GB).
                    - gpu_model: Modelo da placa de vídeo (dê preferência à dedicada se houver).

                    Retorne APENAS um JSON válido no formato:
                    {
                        "source_type": "string",
                        "data": {
                            "ssd_health_percent": number | null,
                            "ssd_tbw": number | null,
                            "cpu_temp_max": number | null,
                            "battery_wear_level": number | null,
                            "battery_cycles": number | null,
                            "cpu_model": "string" | null,
                            "motherboard_model": "string" | null,
                            "ram_total_gb": number | null,
                            "gpu_model": "string" | null
                        }
                    }
                    `
                },
                {
                    role: "user",
                    content: `LOG FILE CONTEXT:\n${truncatedContent}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
        })

        const resultText = completion.choices[0].message.content
        if (!resultText) throw new Error("Retorno vazio da IA")

        const json = JSON.parse(resultText)

        // Remove nulls to keep data clean
        const cleanedData: any = {}
        for (const [key, value] of Object.entries(json.data || {})) {
            if (value !== null && value !== 'N/A') {
                cleanedData[key] = value
            }
        }

        return {
            source: (json.source_type as TelemetrySource) || 'hwinfo',
            success: true,
            data: cleanedData
        }

    } catch (e) {
        console.error("❌ Erro no parseWithAI:", e)
        return { source: 'manual', success: false, error: 'Falha na IA' }
    }
}

function parseCrystalDiskInfo(content: string): ParseResult {
    try {
        const data: Partial<TelemetryInsert> = { source_type: 'crystaldisk' }

        // 1. Health Status (Ex: "Health Status : 98% (Good)")
        const healthMatch = content.match(/Health Status\s*:\s*(\d+)%/)
        if (healthMatch) {
            data.ssd_health_percent = parseInt(healthMatch[1], 10)
        }

        // 2. Temperature (Ex: "Temperature : 38 C (100 F)")
        const tempMatch = content.match(/Temperature\s*:\s*(\d+)\s*C/)
        if (tempMatch) {
            data.cpu_temp_max = parseInt(tempMatch[1], 10)
        }

        // 3. Total Writes (TBW) (Ex: "Total Host Writes : 8560 GB")
        const writesMatch = content.match(/Total Host Writes\s*:\s*(\d+)\s*(GB|MB|TB)/i)
        if (writesMatch) {
            let val = parseInt(writesMatch[1], 10)
            const unit = writesMatch[2].toUpperCase()
            if (unit === 'MB') val = val / 1024 / 1024
            if (unit === 'GB') val = val / 1024
            data.ssd_tbw = parseFloat(val.toFixed(2))
        }

        // 4. Model (Extra)
        const modelMatch = content.match(/Model\s*:\s*(.+)/)
        if (modelMatch) {
            // data.ssd_model = modelMatch[1].trim() // If we add ssd_model later
        }

        return { source: 'crystaldisk', success: true, data }
    } catch (e) {
        return { source: 'crystaldisk', success: false, error: 'Falha ao processar TXT do CrystalDiskInfo.' }
    }
}

function parseHWMonitor(content: string): ParseResult {
    try {
        const data: Partial<TelemetryInsert> = { source_type: 'hwinfo' }
        const lines = content.split('\n')

        let inBatterySection = false

        for (const line of lines) {
            const l = line.trim()

            // CPU Temp
            if (l.includes('degC') && l.includes('Package')) {
                const match = l.match(/(\d+)\s*degC/)
                if (match) {
                    const val = parseInt(match[1], 10)
                    if (!data.cpu_temp_max || val > data.cpu_temp_max) {
                        data.cpu_temp_max = val
                    }
                }
            }

            // Detect Battery Section
            if (l.startsWith('Battery') || l.includes('Current Capacity')) {
                inBatterySection = true
            }

            // Battery Wear
            if (inBatterySection && l.includes('Wear Level')) {
                const match = l.match(/(\d+)\s*%/)
                if (match) {
                    data.battery_wear_level = parseInt(match[1], 10)
                }
            }
        }

        return { source: 'hwinfo', success: true, data }
    } catch (e) {
        return { source: 'hwinfo', success: false, error: 'Falha ao processar TXT do HWMonitor.' }
    }
}

function parseHWiNFO_TXT(content: string): ParseResult {
    try {
        const data: Partial<TelemetryInsert> = { source_type: 'hwinfo' }

        // 1. CPU Model
        const cpuMatch = content.match(/Processor Name:\s*(.+)/i)
        if (cpuMatch) data.cpu_model = cpuMatch[1].trim()

        // 2. Motherboard
        const moboMatch = content.match(/Motherboard Model:\s*(.+)/i)
        if (moboMatch) data.motherboard_model = moboMatch[1].trim()

        // 3. RAM
        const ramMatch = content.match(/Total Memory Size:\s*(\d+)\s*(GB|MB|KB)/i)
        if (ramMatch) {
            let val = parseInt(ramMatch[1], 10)
            const unit = ramMatch[2].toUpperCase()
            if (unit === 'MB') val = val / 1024
            if (unit === 'KB') val = val / 1024 / 1024
            data.ram_total_gb = Math.round(val)
        }

        // 4. GPU
        const gpuMatch = content.match(/Video Adapter:\s*(.+)/i)
        if (gpuMatch) data.gpu_model = gpuMatch[1].trim()

        // 5. CPU Temp (Robust Regex)
        const tempPatterns = [
            /(?:CPU Package|CPU Temperature|Core Max)(?:[^:]*):\s*(\d+)/i,
            /Temperature\s*.*\s*(\d+)\s*°C/i
        ]

        for (const p of tempPatterns) {
            const m = content.match(p)
            if (m) {
                data.cpu_temp_max = parseInt(m[1], 10)
                break
            }
        }

        // 6. Battery Wear
        const wearMatch = content.match(/Wear Level\s*:\s*(\d+(?:\.\d+)?)\s*%/)
        if (wearMatch) {
            data.battery_wear_level = Math.round(parseFloat(wearMatch[1]))
        }

        // 7. Drive Remaining Life
        const lifeMatch = content.match(/(?:Drive Remaining Life|Estimated Life)\s*:\s*(\d+(?:\.\d+)?)\s*%/)
        if (lifeMatch) {
            data.ssd_health_percent = Math.round(parseFloat(lifeMatch[1]))
        }

        return { source: 'hwinfo', success: true, data }
    } catch (e) {
        return { source: 'hwinfo', success: false, error: 'Falha ao processar TXT do HWiNFO.' }
    }
}

function parseHWiNFO(content: string): ParseResult {
    try {
        const data: Partial<TelemetryInsert> = { source_type: 'hwinfo' }
        const lines = content.split('\n')

        let maxColIndex = -1
        let labelColIndex = -1

        const headerIndex = lines.findIndex(l => l.toLowerCase().includes('sensor') || l.toLowerCase().includes('label'))
        if (headerIndex === -1) throw new Error("Cabeçalho não encontrado")

        const headers = lines[headerIndex].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())
        maxColIndex = headers.indexOf('max')
        labelColIndex = headers.indexOf('label')

        if (maxColIndex === -1 || labelColIndex === -1) {
            maxColIndex = 4
            labelColIndex = 1
        }

        for (let i = headerIndex + 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(c => c.replace(/"/g, '').trim())
            if (row.length < maxColIndex) continue

            const label = row[labelColIndex].toLowerCase()
            const val = parseFloat(row[maxColIndex])

            if (isNaN(val)) continue

            if (label.includes('cpu package') || label.includes('cpu temperature') || label.includes('gpu temperature')) {
                if (!data.cpu_temp_max || val > data.cpu_temp_max) {
                    data.cpu_temp_max = val
                }
            }

            if (label.includes('wear level') || label.includes('battery health')) {
                data.battery_wear_level = Math.round(val)
            }

            if (label.includes('drive remaining life') || label.includes('ssd life')) {
                data.ssd_health_percent = Math.round(val)
            }
        }

        return { source: 'hwinfo', success: true, data }
    } catch (e) {
        return { source: 'hwinfo', success: false, error: 'Falha ao processar CSV do HWiNFO.' }
    }
}

// ----------------------------------------------------------------------
// HEALTH SCORE LOGIC
// ----------------------------------------------------------------------

function calculateHealthScore(data: Partial<TelemetryInsert>) {
    const W_SSD = 0.4
    const W_TEMP = 0.3
    const W_BATT = 0.3

    let score = 0
    let totalWeight = 0

    if (data.ssd_health_percent !== undefined) {
        score += data.ssd_health_percent * W_SSD
        totalWeight += W_SSD
    }

    if (data.cpu_temp_max !== undefined) {
        let tempScore = 100
        if (data.cpu_temp_max > 50) {
            tempScore = Math.max(0, 100 - (data.cpu_temp_max - 50))
        }
        score += tempScore * W_TEMP
        totalWeight += W_TEMP
    }

    if (data.battery_wear_level !== undefined) {
        const battScore = Math.max(0, 100 - data.battery_wear_level)
        score += battScore * W_BATT
        totalWeight += W_BATT
    }

    // Default: if absolutely no data found but file was valid, return 0 or maybe 100?
    // Let's keep 0 to indicate "Missing Data" rather than false confidence.
    if (totalWeight === 0) return 0

    const finalScore = Math.round(score / totalWeight)
    return Math.min(100, Math.max(0, finalScore))
}

// ----------------------------------------------------------------------
// MAIN ACTION
// ----------------------------------------------------------------------

export async function uploadTelemetry(orderId: string, equipmentId: string, tenantId: string, formData: FormData) {
    const supabase = await createClient()

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const file = formData.get('file') as File
    if (!file) return { success: false, error: 'No file provided' }

    const content = await file.text()
    const fileName = file.name.toLowerCase()

    let result: ParseResult = { source: 'manual', success: false, error: 'Formato desconhecido' }

    // 1. First pass: Try Regex Parsers
    if (fileName.endsWith('.txt') || fileName.endsWith('.log')) {
        if (content.includes('CrystalDiskInfo')) {
            result = parseCrystalDiskInfo(content)
        } else if (content.includes('CPUID HWMonitor')) {
            result = parseHWMonitor(content)
        } else if (content.includes('HWiNFO') || content.includes('Sensor Status')) {
            result = parseHWiNFO_TXT(content)
        } else {
            result = parseCrystalDiskInfo(content)
            if (!result.success || !result.data || Object.keys(result.data).length <= 1) {
                const hwResult = parseHWiNFO_TXT(content)
                if (hwResult.success && hwResult.data && Object.keys(hwResult.data).length > 1) {
                    result = hwResult
                }
            }
        }
    } else if (fileName.endsWith('.csv')) {
        result = parseHWiNFO(content)
    }

    // 2. Second pass: If Regex results are weak (missing key Enhanced Specs), Try AI
    // Key specs we really want: cpu_model, ram_total_gb, or at least cpu_temp_max
    const hasDetailedInfo = result.success && result.data && (
        result.data.cpu_model ||
        result.data.motherboard_model ||
        result.data.ram_total_gb
    )

    if (!hasDetailedInfo) {
        console.log("⚠️ Regex parser result poor. Encouraging AI fallback...")
        const aiResult = await parseWithAI(content)
        if (aiResult.success && aiResult.data) {
            // Merge AI data with regex data (AI takes precedence if Regex was empty, but regex is usually safer for numbers if it found them)
            // Actually, let's let AI override if regex found nothing useful
            if (!result.data) {
                result = aiResult
            } else {
                // Merge: Keep regex values if present, fill with AI
                result.data = { ...result.data, ...aiResult.data }

                // If regex missed critical health data but AI found it, great.
                // If regex found health data but missed specs, AI fills specs.
            }
            result.source = aiResult.source // AI detection might be better
            result.success = true
        }
    }

    if (!result.success || !result.data) {
        return { success: false, error: result.error || 'Falha na análise do arquivo (Regex + AI).' }
    }

    const healthScore = calculateHealthScore(result.data)

    // Robust Tenant Resolution
    let resolvedTenantId = tenantId
    let adminQueryError = null

    if (!resolvedTenantId) {
        resolvedTenantId = user.user_metadata?.tenant_id
        if (!resolvedTenantId) {
            resolvedTenantId = (user.app_metadata as any)?.tenant_id
        }
        if (!resolvedTenantId) {
            const adminSupabase = await createAdminClient()
            const { data: order, error } = await adminSupabase.from('orders').select('user_id').eq('id', orderId).single()
            if (error) {
                adminQueryError = error.message
            } else if (order) {
                resolvedTenantId = order.user_id
            }
        }
    }

    if (!resolvedTenantId) {
        return { success: false, error: 'CRITICO: Tenant ID não encontrado.' }
    }

    // Save to DB using Admin Client
    const adminSupabase = await createAdminClient()
    const payload: TelemetryInsert = {
        order_id: orderId,
        equipment_id: equipmentId,
        source_type: result.source,
        raw_content: content.slice(0, 50000), // Safety clip
        health_score: healthScore,
        ...result.data
    }

    const { error } = await adminSupabase.from('hardware_telemetry').insert({
        ...payload,
        tenant_id: resolvedTenantId
    })

    if (error) {
        console.error("Telemetry insert error:", error)
        return { success: false, error: `Erro ao salvar no banco: ${error.message}` }
    }

    revalidatePath(`/dashboard/orders/${orderId}`)
    return { success: true, healthScore, data: result.data }
}
