import { TelemetryInsert } from "@/types/telemetry"

// Enhanced HWiNFO TXT Parser - Supports Portuguese format
function parseHWiNFO_TXT_Enhanced(content: string): Partial<TelemetryInsert> {
    const data: Partial<TelemetryInsert> = { source_type: 'hwinfo' }
    try {

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
            /Health Status:\s*(\d+)%/i,
            /Capacidade sobressalente disponível:\s*(\d+)%/i, // SSD Spare (NVMe)
            /Available Spare:\s*(\d+)%/i
        ]

        for (const pattern of ssdHealthPatterns) {
            const match = content.match(pattern)
            if (match) {
                // If it's Available Spare, it's already health (100% is good)
                data.ssd_health_percent = parseInt(match[1], 10)
                break
            }
        }

        // 6. Temperature (Prioritize CPU, fallback to SSD if missing)
        const tempPatterns = [
            /Temperaturas?\s+.*\s+Package:\s*(\d+)\s*°C/i, // HWiNFO Sensor style
            /CPU Package:\s*(\d+)\s*°C/i,
            /Tj\(Max\):\s*(\d+)\s*°C/i,
            /Temperatura do disco:\s*(\d+)\s*°C/i,
            /Drive Temperature:\s*(\d+)\s*°C/i
        ]

        for (const pattern of tempPatterns) {
            const match = content.match(pattern)
            if (match) {
                data.cpu_temp_max = parseInt(match[1], 10)
                break
            }
        }

        // 7. RAM Details (Speed and Slots) - Expanded patterns
        const speedPatterns = [
            /Relógio da Memória:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Memory Speed:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Memory Clock:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Velocidade da memória:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Frequência da memória:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Frequência de memória atual:\s*(\d+(?:\.\d+)?)\s*MHz/i
        ];

        for (const pattern of speedPatterns) {
            const match = content.match(pattern);
            if (match) {
                let speed = parseFloat(match[1]);
                // If it's a clock speed (like 666, 1066, 1333), some users might prefer the DDR speed
                // But for now we'll take the value found.
                data.ram_speed = Math.round(speed);
                break;
            }
        }

        // Count RAM slots by looking for Memory Module sections
        const slotMatches = content.match(/Módulo de memória(?: \[#\d+\])?:\s*/gi) ||
            content.match(/Memory Module(?: \[#\d+\])?:\s*/gi) ||
            content.match(/Informações gerais do módulo/gi) ||
            content.match(/Número do módulo:\s*\d+/gi) ||
            content.match(/Slot de memória:/gi);
        if (slotMatches) {
            data.ram_slots = slotMatches.length;
        }

        // 8. Storage Capacity
        const storageSizePatterns = [
            /Capacidade do disco:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i,
            /Drive Capacity:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i,
            /Disk Size:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i,
            /Tamanho do disco:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i,
            /Capacidade de unidade:\s*.*\((\d+)\s*GB\)/i, // Portuguese T480 style
            /Capacidade de unidade:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i
        ];

        for (const pattern of storageSizePatterns) {
            const match = content.match(pattern);
            if (match) {
                let val = parseFloat(match[1].replace(',', '.'));
                const unit = (match[2] || 'GB').toUpperCase();
                if (unit && unit.includes('TBYTES')) val = val * 1024;
                data.ssd_total_gb = Math.round(val);
                break;
            }
        }

        // 9. Battery
        const batteryPatterns = [
            /Nível de desgaste:\s*(\d+(?:\.\d+)?)\s*%/i,
            /Wear Level:\s*(\d+(?:\.\d+)?)\s*%/i
        ]

        for (const pattern of batteryPatterns) {
            const match = content.match(pattern)
            if (match) {
                data.battery_wear_level = Math.round(parseFloat(match[1]));
                break
            }
        }

        console.log('🔍 HWiNFO TXT Enhanced Parser Result:', JSON.stringify(data, null, 2))

        return data
    } catch (e) {
        console.error('❌ Error in parseHWiNFO_TXT_Enhanced:', e)
        return data
    }
}

export { parseHWiNFO_TXT_Enhanced }
