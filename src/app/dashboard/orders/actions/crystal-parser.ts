import { TelemetryInsert } from "@/types/telemetry";

/**
 * CrystalDiskInfo TXT Parser
 * Refined for real-world exports (v9.x+)
 */
export function parseCrystalDiskInfo_TXT(content: string): Partial<TelemetryInsert> {
    const data: Partial<TelemetryInsert> = {};

    try {
        // 1. Health Percent
        // Example: "Health Status : Good (96 %)"
        const healthMatch = content.match(/(?:Health Status|Status de Saúde)\s*:\s*.*\((\d+)\s*%\)/i);
        if (healthMatch) {
            data.ssd_health_percent = parseInt(healthMatch[1], 10);
        }

        // 2. Total Bytes Written (TBW)
        // Example: "Host Writes : 30677 GB"
        const tbwMatch = content.match(/(?:Host Writes|Escritas do Host)\s*:\s*(\d+)\s*(GB|TB)/i);
        if (tbwMatch) {
            let val = parseInt(tbwMatch[1], 10);
            if (tbwMatch[2].toUpperCase() === 'TB') val = val * 1024;
            data.ssd_tbw = val;
        }

        // Disk Size
        // Example: Disk Size : 256,0 GB
        const sizeMatch = content.match(/(?:Disk Size|Tamanho do Disco)\s*:\s*([\d,.]+)\s*(GB|TB)/i);
        if (sizeMatch) {
            let val = parseFloat(sizeMatch[1].replace(',', '.'));
            if (sizeMatch[2].toUpperCase() === 'TB') val = val * 1024;
            data.ssd_total_gb = Math.round(val);
        }

        // 3. SSD Temperature
        // Example: "Temperature : 52 C (125 F)"
        const tempMatch = content.match(/Temperature\s*:\s*(\d+)\s*C/i);
        if (tempMatch) {
            // Note: We use cpu_temp_max as a generic field for temperature alerts in some views,
            // but maybe we should add ssd_temp to the schema later.
            // For now, let's keep it in logs or generic temp if needed.
        }

        // 4. Model
        const modelMatch = content.match(/Model\s*:\s*(.*)/i) ||
            content.match(/Modelo\s*:\s*(.*)/i);
        // Information only for now
    } catch (error) {
        console.error("Error parsing CrystalDiskInfo TXT:", error);
    }

    return data;
}
