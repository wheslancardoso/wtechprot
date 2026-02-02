
const fs = require('fs');
const path = require('path');

// Mock TelemetryInsert type
const TelemetryInsert = {};

// Copied from hwinfo-parser-enhanced.ts (with slight modification for Node.js)
function parseHWiNFO_TXT_Enhanced(content) {
    const data = { source_type: 'hwinfo' }
    try {

        // 1. CPU Model
        const cpuPatterns = [
            /Nome do processador:\s*(.+)/i,
            /Processor Name:\s*(.+)/i,
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
            }
        }

        // 3. RAM Size
        const ramPatterns = [
            /Tamanho total da memória:\s*(\d+)\s*(GBytes?|MBytes?|GB|MB)/i,
            /Total Memory Size:\s*(\d+)\s*(GBytes?|MBytes?|GB|MB)/i
        ]

        for (const pattern of ramPatterns) {
            const match = content.match(pattern)
            if (match) {
                let val = parseInt(match[1], 10)
                const unit = match[2].toUpperCase()
                if (unit.includes('MB')) val = Math.round(val / 1024)
                data.ram_total_gb = val
                break
            }
        }

        // 7. RAM Details (Speed and Slots) - THE PART WE ARE DEBUGGING
        const speedPatterns = [
            /Relógio da Memória:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Memory Speed:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Memory Clock:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Velocidade da memória:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Frequência da memória:\s*(\d+(?:\.\d+)?)\s*MHz/i,
            /Frequência de memória atual:\s*(\d+(?:\.\d+)?)\s*MHz/i
        ];

        console.log('--- Debugging RAM Speed ---');
        for (const pattern of speedPatterns) {
            const match = content.match(pattern);
            console.log(`Pattern ${pattern.source}: ${match ? 'MATCHED: ' + match[1] : 'FAILED'}`);
            if (match) {
                data.ram_speed = Math.round(parseFloat(match[1]));
                break;
            }
        }

        console.log('--- Debugging RAM Slots ---');
        // Count RAM slots by looking for Memory Module sections
        const slotPatterns = [
            /Módulo de memória(?: \[#\d+\])?:\s*/gi,
            /Memory Module(?: \[#\d+\])?:\s*/gi,
            /Informações gerais do módulo/gi,
            /Número do módulo:\s*\d+/gi
        ];

        for (const pattern of slotPatterns) {
            const matches = content.match(pattern);
            console.log(`Pattern ${pattern.source}: ${matches ? 'FOUND ' + matches.length : 'FAILED'}`);
            if (matches) {
                data.ram_slots = matches.length;
                break;
            }
        }

        // 8. Storage Capacity
        const storageSizePatterns = [
            /Capacidade do disco:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i,
            /Drive Capacity:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i,
            /Disk Size:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i,
            /Tamanho do disco:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i,
            /Capacidade de unidade:\s*.*\((\d+)\s*GB\)/i,
            /Capacidade de unidade:\s*([\d,.]+)\s*(GB|TBytes|GBytes)/i
        ];

        console.log('--- Debugging SSD Size ---');
        for (const pattern of storageSizePatterns) {
            const match = content.match(pattern);
            console.log(`Pattern ${pattern.source}: ${match ? 'MATCHED: ' + match[1] : 'FAILED'}`);
            if (match) {
                let val = parseFloat(match[1].replace(',', '.'));
                data.ssd_total_gb = Math.round(val);
                break;
            }
        }

        return data
    } catch (e) {
        console.error(e);
        return data
    }
}

const content = fs.readFileSync('/home/lan/wtechapp/T480.LOG', 'utf8');
const result = parseHWiNFO_TXT_Enhanced(content);
console.log('\nFINAL RESULT:', JSON.stringify(result, null, 2));
