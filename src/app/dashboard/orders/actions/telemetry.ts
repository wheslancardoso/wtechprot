'use server'

import { parseCrystalDiskInfo_TXT } from './crystal-parser'
import { parseHWiNFO_TXT_Enhanced } from './hwinfo-parser-enhanced'
import { parseHWMonitor_TXT } from './hwmonitor-parser'
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
// HELPERS (Storage Optimization)
// ----------------------------------------------------------------------

/**
 * Removes huge redundant sections from HWiNFO logs to save database space
 * while keeping essential technical specs and sensor data.
 */
function slimHWiNFOLog(content: string): string {
    if (!content.includes('HWiNFO')) return content;

    const lines = content.split('\n');
    let slimmedLines: string[] = [];
    let skipSection = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Detect sections to skip
        // 1. Feature Flags (Sinalizadores de recurso)
        if (trimmed.startsWith('[Sinalizadores de recurso') ||
            trimmed.startsWith('[Sinalizadores de recurso estendido]') ||
            trimmed.startsWith('[Mecanismos de mitigação de vulnerabilidade]')) {
            skipSection = true;
            slimmedLines.push(line + " [SEÇÃO REMOVIDA PARA ECONOMIZAR ESPAÇO]");
            continue;
        }

        // 2. PCI Bus details (usually huge and technical bridge data)
        if (trimmed.startsWith('PCI Barramento #') || trimmed.startsWith('PCI Bus #')) {
            skipSection = true;
            slimmedLines.push(line + " [DETALHES DE BARRAMENTO REMOVIDOS]");
            continue;
        }

        // Detect important section headers to resume saving
        if (trimmed.startsWith('Placa-mãe') ||
            trimmed.startsWith('Motherboard') ||
            trimmed.startsWith('Dispositivos ACPI') ||
            trimmed.startsWith('SMBIOS DMI') ||
            trimmed.startsWith('Memória') ||
            trimmed.startsWith('Memory') ||
            trimmed.startsWith('Unidades de disco') ||
            trimmed.startsWith('Drives') ||
            trimmed.startsWith('Bateria') ||
            trimmed.startsWith('Battery') ||
            trimmed.startsWith('Sensor Status')) {
            skipSection = false;
        }

        if (!skipSection) {
            slimmedLines.push(line);
        }
    }

    // Optimization: If we didn't find any headers to resume, just return first 500 lines as safety
    if (slimmedLines.length < 50 && lines.length > 500) {
        return lines.slice(0, 500).join('\n') + "\n[LOG TRUNCADO POR SEGURANÇA]";
    }

    return slimmedLines.join('\n');
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
                    
                    - source_type: 'hwinfo' | 'crystaldisk' | 'hwmonitor' | 'manual' (infira pelo conteúdo)
                    - ssd_health_percent: Saúde do SSD/HD (0-100)
                    - ssd_tbw: Total Bytes Written (em TB).
                    - ssd_total_gb: Capacidade total do disco (em GB).
                    - cpu_temp_max: Temperatura MÁXIMA registrada da CPU (°C).
                    - battery_wear_level: Nível de desgaste da bateria (%) (0-100).
                    - battery_cycles: Contagem de ciclos da bateria.
                    - cpu_model: Nome completo do processador.
                    - motherboard_model: Modelo da placa mãe.
                    - ram_total_gb: Total de memória RAM instalada (em GB).
                    - ram_speed: Frequência da RAM (em MHz).
                    - ram_slots: Quantidade de pentes/slots ocupados.
                    - gpu_model: Modelo da placa de vídeo.

                    Retorne APENAS um JSON:
                    {
                        "source_type": "string",
                        "data": {
                            "ssd_health_percent": number | null,
                            "ssd_tbw": number | null,
                            "ssd_total_gb": number | null,
                            "cpu_temp_max": number | null,
                            "battery_wear_level": number | null,
                            "battery_cycles": number | null,
                            "cpu_model": "string" | null,
                            "motherboard_model": "string" | null,
                            "ram_total_gb": number | null,
                            "ram_speed": number | null,
                            "ram_slots": number | null,
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

        // 1. CPU Model - Multiple patterns for different languages
        const cpuPatterns = [
            /Nome do processador:\s*(.+)/i,  // Portuguese
            /Processor Name:\s*(.+)/i,       // English
            /CPU ID.*\n.*Nome da marca da CPU:\s*(.+)/i,
            /Intel Core [^\n]+/,
            /AMD Ryzen [^\n]+/
        ]

        for (const pattern of cpuPatterns) {
            const match = content.match(pattern)
            if (match && match[1] && match[1].trim().length > 5) {
                data.cpu_model = match[1].trim()
                break
            } else if (match && match[0] && (match[0].includes('Intel Core') || match[0].includes('AMD Ryzen'))) {
                data.cpu_model = match[0].trim()
                break
            }
        }

        // 2. Motherboard - Portuguese and English
        const moboPatterns = [
            /Modelo de placa-mãe:\s*(.+)/i,  // Portuguese
            /Motherboard Model:\s*(.+)/i,     // English
            /Nome da placa-mãe:\s*(.+)/i
        ]

        for (const pattern of moboPatterns) {
            const match = content.match(pattern)
            if (match && match[1] && match[1].trim().length > 3) {
                data.motherboard_model = match[1].trim()
                break
            }
        }

        // 3. RAM - Sum all memory modules
        const ramPatterns = [
            /Tamanho total da memória:\s*(\d+)\s*(GBytes?|MBytes?|GB|MB)/i,  // Portuguese
            /Total Memory Size:\s*(\d+)\s*(GBytes?|MBytes?|GB|MB)/i,         // English
            /Total.*Memory.*:\s*(\d+)\s*(GB|MB)/i
        ]

        for (const pattern of ramPatterns) {
            const match = content.match(pattern)
            if (match) {
                let val = parseInt(match[1], 10)
                const unit = match[2].toUpperCase()
                if (unit.includes('MB') || unit.includes('MBYTES')) {
                    val = Math.round(val / 1024)
                }
                data.ram_total_gb = val
                break
            }
        }

        // 4. GPU - Look for dedicated GPU first, then integrated
        const gpuPatterns = [
            /Conjunto de chips gráficos:\s*(.+)/i,  // Portuguese
            /Graphics Chipset:\s*(.+)/i,            // English
            /Placa de vídeo:\s*(.+)/i,
            /Video Card:\s*(.+)/i
        ]

        for (const pattern of gpuPatterns) {
            const match = content.match(pattern)
            if (match && match[1] && match[1].trim().length > 5) {
                const gpu = match[1].trim()
                if (!gpu.includes('Integrated') || !data.gpu_model) {
                    data.gpu_model = gpu
                    if (!gpu.includes('Intel UHD') && !gpu.includes('Intel HD')) {
                        break
                    }
                }
            }
        }

        // 5. SSD/NVMe Health
        const ssdHealthPatterns = [
            /Saúde do dispositivo:\s*(\d+)%/i,      // Portuguese
            /Device Health:\s*(\d+)%/i,             // English
            /Health Status:\s*(\d+)%/i
        ]

        for (const pattern of ssdHealthPatterns) {
            const match = content.match(pattern)
            if (match) {
                data.ssd_health_percent = parseInt(match[1], 10)
                break
            }
        }

        // 6. SSD Temperature
        const ssdTempPatterns = [
            /Temperatura do disco:\s*(\d+)\s*°C/i,  // Portuguese
            /Drive Temperature:\s*(\d+)\s*°C/i,     // English
        ]

        for (const pattern of ssdTempPatterns) {
            const match = content.match(pattern)
            if (match) {
                data.cpu_temp_max = parseInt(match[1], 10)
                break
            }
        }

        // 7. Battery Information (from "Bateria portátil" section)
        // Note: HWiNFO may not always show Wear Level or Cycle Count in TXT exports
        // We'll try to extract what's available

        const batteryWearPatterns = [
            /Nível de desgaste:\s*(\d+(?:\.\d+)?)\s*%/i,           // Portuguese "Nível de desgaste"
            /Wear Level:\s*(\d+(?:\.\d+)?)\s*%/i,                  // English
            /Desgaste da bateria:\s*(\d+(?:\.\d+)?)\s*%/i,         // Portuguese "Battery Wear"
            /Battery Wear:\s*(\d+(?:\.\d+)?)\s*%/i,                // English
        ]

        for (const pattern of batteryWearPatterns) {
            const match = content.match(pattern)
            if (match) {
                data.battery_wear_level = Math.round(parseFloat(match[1]))
                break
            }
        }

        // Try to calculate wear from capacity if available
        if (!data.battery_wear_level) {
            const designCapMatch = content.match(/Capacidade de design:\s*(\d+)\s*mWh/i)
            const fullCapMatch = content.match(/Capacidade total:\s*(\d+)\s*mWh/i)

            if (designCapMatch && fullCapMatch) {
                const design = parseInt(designCapMatch[1], 10)
                const full = parseInt(fullCapMatch[1], 10)
                if (design > 0) {
                    data.battery_wear_level = Math.round(((design - full) / design) * 100)
                }
            }
        }

        // 8. Battery Cycles
        const batteryCyclesPatterns = [
            /Contagem de ciclo:\s*(\d+)/i,                         // Portuguese "Contagem de ciclo" (singular)
            /Contagem de ciclos:\s*(\d+)/i,                        // Portuguese "Contagem de ciclos" (plural)
            /Cycle Count:\s*(\d+)/i,                               // English
            /Ciclos da bateria:\s*(\d+)/i,                         // Portuguese alt
            /Battery Cycles:\s*(\d+)/i,                            // English alt
            /Ciclos de energia:\s*(\d+)/i                          // Portuguese "Power Cycles"
        ]

        for (const pattern of batteryCyclesPatterns) {
            const match = content.match(pattern)
            if (match) {
                data.battery_cycles = parseInt(match[1], 10)
                break
            }
        }

        console.log('🔍 HWiNFO TXT Parser Result:', JSON.stringify(data, null, 2))

        return { source: 'hwinfo', success: true, data }
    } catch (e) {
        console.error('❌ Error in parseHWiNFO_TXT:', e)
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

export async function uploadTelemetry(
    orderId: string,
    equipmentId: string,
    tenantId: string,
    formData: FormData,
    stage: 'initial' | 'post_repair' | 'final' = 'initial'
) {
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
            const data = parseCrystalDiskInfo_TXT(content);
            result = { source: 'crystaldisk', success: Object.keys(data).length > 0, data };
        } else if (content.includes('CPUID HWMonitor')) {
            const data = parseHWMonitor_TXT(content);
            result = { source: 'hwmonitor', success: Object.keys(data).length > 0, data };
        } else if (content.includes('HWiNFO') || content.includes('Sensor Status') || content.includes('Processor Name:')) {
            const data = parseHWiNFO_TXT_Enhanced(content);
            result = { source: 'hwinfo', success: Object.keys(data).length > 0, data };
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

    // 2. Second pass: If Regex results are weak or missing detailed fields, Try AI
    const hasEssentialInfo = result.success && result.data && (
        result.data.cpu_model &&
        result.data.ram_total_gb &&
        (result.data.ram_speed || result.data.ram_slots || result.source !== 'hwinfo')
    )

    if (!hasEssentialInfo) {
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

    // DEBUG: Log what was extracted
    console.log('🔍 Parser Result:', JSON.stringify({
        source: result.source,
        success: result.success,
        dataKeys: Object.keys(result.data || {}),
        cpu_model: result.data?.cpu_model,
        ram_total_gb: result.data?.ram_total_gb,
        gpu_model: result.data?.gpu_model,
        motherboard_model: result.data?.motherboard_model
    }, null, 2))

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

    // Slim the log ONLY after parsing is DONE (to ensure parsers see the full thing)
    const slimmedContent = slimHWiNFOLog(content);

    const payload: TelemetryInsert = {
        order_id: orderId,
        equipment_id: equipmentId,
        source_type: result.source,
        raw_content: slimmedContent.slice(0, 150000), // Safety clip on slimmed content
        health_score: healthScore,
        stage: stage,
        ...result.data
    }

    // DEBUG: Log what we're about to save
    console.log('📊 Telemetry Payload:', JSON.stringify({
        source: result.source,
        cpu_model: payload.cpu_model,
        ram_total_gb: payload.ram_total_gb,
        gpu_model: payload.gpu_model,
        motherboard_model: payload.motherboard_model,
        ssd_health_percent: payload.ssd_health_percent,
        cpu_temp_max: payload.cpu_temp_max
    }, null, 2))

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

// ----------------------------------------------------------------------
// REPROCESS EXISTING TELEMETRY
// ----------------------------------------------------------------------

export async function reprocessTelemetry(telemetryId: string) {
    try {
        const adminSupabase = await createAdminClient()

        // 1. Fetch the existing record
        const { data: telemetry, error: fetchError } = await adminSupabase
            .from('hardware_telemetry')
            .select('*')
            .eq('id', telemetryId)
            .single()

        if (fetchError || !telemetry) {
            return { success: false, error: 'Registro não encontrado' }
        }

        if (!telemetry.raw_content) {
            return { success: false, error: 'raw_content vazio' }
        }

        console.log('🔄 Reprocessing telemetry:', telemetryId)

        // 2. Determine file type and parse
        const content = telemetry.raw_content
        let result: ParseResult = { source: 'manual', success: false }

        // Try to detect format from content
        if (content.includes('CrystalDiskInfo')) {
            const data = parseCrystalDiskInfo_TXT(content);
            result = { source: 'crystaldisk', success: Object.keys(data).length > 0, data };
        } else if (content.includes('CPUID HWMonitor')) {
            const data = parseHWMonitor_TXT(content);
            result = { source: 'hwmonitor', success: Object.keys(data).length > 0, data };
        } else if (content.includes('HWiNFO') || content.includes('Sensor Status') || content.toLowerCase().includes('processor name')) {
            const data = parseHWiNFO_TXT_Enhanced(content);
            result = { source: 'hwinfo', success: Object.keys(data).length > 0, data };
        } else {
            // Fallback
            const data = parseHWiNFO_TXT_Enhanced(content);
            result = { source: 'hwinfo', success: Object.keys(data).length > 0, data };
        }

        // 3. If regex parsing failed or incomplete, try AI
        const hasEssentialInfo = result.success && result.data && (
            result.data.cpu_model &&
            result.data.ram_total_gb &&
            (result.data.ram_speed || result.data.ram_slots || result.source !== 'hwinfo')
        )

        if (!hasEssentialInfo) {
            console.log('⚠️ Regex incomplete, trying AI...')
            const aiResult = await parseWithAI(content)
            if (aiResult.success && aiResult.data) {
                if (!result.data) {
                    result = aiResult
                } else {
                    result.data = { ...result.data, ...aiResult.data }
                }
                result.source = aiResult.source
                result.success = true
            }
        }

        if (!result.success || !result.data) {
            return { success: false, error: 'Falha ao reprocessar' }
        }

        // 4. Recalculate health score
        const healthScore = calculateHealthScore(result.data)

        // 5. Update the record
        const updatePayload: any = {
            source_type: result.source,
            health_score: healthScore,
            cpu_model: result.data.cpu_model || null,
            motherboard_model: result.data.motherboard_model || null,
            ram_total_gb: result.data.ram_total_gb || null,
            ram_speed: result.data.ram_speed || null,
            ram_slots: result.data.ram_slots || null,
            gpu_model: result.data.gpu_model || null,
            ssd_health_percent: result.data.ssd_health_percent || null,
            ssd_total_gb: result.data.ssd_total_gb || null,
            ssd_tbw: result.data.ssd_tbw || null,
            cpu_temp_max: result.data.cpu_temp_max || null,
            battery_wear_level: result.data.battery_wear_level || null,
            battery_cycles: result.data.battery_cycles || null
        }

        console.log('✅ Updating with:', JSON.stringify(updatePayload, null, 2))

        const { error: updateError } = await adminSupabase
            .from('hardware_telemetry')
            .update(updatePayload)
            .eq('id', telemetryId)

        if (updateError) {
            console.error('Update error:', updateError)
            return { success: false, error: updateError.message }
        }

        // 6. Revalidate the order page
        revalidatePath(`/dashboard/orders/${telemetry.order_id}`)

        return { success: true, data: updatePayload }

    } catch (error) {
        console.error('Reprocess error:', error)
        return { success: false, error: 'Erro ao reprocessar' }
    }
}
