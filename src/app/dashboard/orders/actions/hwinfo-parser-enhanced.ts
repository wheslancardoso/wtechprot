// Enhanced HWiNFO TXT Parser - Supports Portuguese format
function parseHWiNFO_TXT_Enhanced(content: string): ParseResult {
    try {
        const data: Partial<TelemetryInsert> = { source_type: 'hwinfo' }

        // 1. CPU Model - Multiple patterns for different languages
        const cpuPatterns = [
            /Nome do processador:\s*(.+)/i,  // Portuguese
            /Processor Name:\s*(.+)/i,       // English
            /CPU:\s*Intel Core.+/i,
            /CPU:\s*AMD.+/i,
            /Intel Core [^\n]+/,
            /AMD Ryzen [^\n]+/
        ]

        for (const pattern of cpuPatterns) {
            const match = content.match(pattern)
            if (match && match[1] && match[1].trim().length > 5) {
                data.cpu_model = match[1].trim()
                break
            } else if (match && match[0] && match[0].includes('Intel Core')) {
                data.cpu_model = match[0].trim()
                break
            } else if (match && match[0] && match[0].includes('AMD Ryzen')) {
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
            /Video Card:\s*(.+)/i,
            /GPU:\s*(.+)/i
        ]

        for (const pattern of gpuPatterns) {
            const match = content.match(pattern)
            if (match && match[1] && match[1].trim().length > 5) {
                const gpu = match[1].trim()
                // Skip if it's just a generic description
                if (!gpu.includes('Integrated') || !data.gpu_model) {
                    data.gpu_model = gpu
                    if (!gpu.includes('Intel UHD') && !gpu.includes('Intel HD')) {
                        break // Found dedicated GPU, stop
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
            /Disk Temperature:\s*(\d+)\s*°C/i
        ]

        for (const pattern of ssdTempPatterns) {
            const match = content.match(pattern)
            if (match) {
                data.cpu_temp_max = parseInt(match[1], 10)
                break
            }
        }

        // 7. Battery
        const batteryPatterns = [
            /Capacidade sobressalente disponível:\s*(\d+)%/i,  // Portuguese "Available Spare"
            /Available Spare:\s*(\d+)%/i
        ]

        for (const pattern of batteryPatterns) {
            const match = content.match(pattern)
            if (match) {
                const spare = parseInt(match[1], 10)
                data.battery_wear_level = 100 - spare  // Invert: spare 100% = wear 0%
                break
            }
        }

        console.log('🔍 HWiNFO TXT Enhanced Parser Result:', JSON.stringify(data, null, 2))

        return { source: 'hwinfo', success: true, data }
    } catch (e) {
        console.error('❌ Error in parseHWiNFO_TXT_Enhanced:', e)
        return { source: 'hwinfo', success: false, error: 'Falha ao processar TXT do HWiNFO.' }
    }
}

export { parseHWiNFO_TXT_Enhanced }
