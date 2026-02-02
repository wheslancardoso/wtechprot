import { TelemetryInsert } from "@/types/telemetry";

/**
 * Enhanced HWMonitor TXT Parser
 * Extracts hardware data from CPUID HWMonitor Report files
 */
export function parseHWMonitor_TXT(content: string): Partial<TelemetryInsert> {
    const data: Partial<TelemetryInsert> = {};

    try {
        // 1. Motherboard
        const mbMatch = content.match(/Mainboard Model\t\t(.*?)\s*\(/i);
        if (mbMatch) data.motherboard_model = mbMatch[1].trim();

        // 2. CPU Model
        const cpuMatch = content.match(/Specification\t\t(.*)/i);
        if (cpuMatch) data.cpu_model = cpuMatch[1].trim();

        // 3. GPU Model
        // HWMonitor lists GPUs under "Display Adapters"
        const displayAdaptersSection = content.split(/Display Adapters/i)[1];
        if (displayAdaptersSection) {
            const gpuNameMatch = displayAdaptersSection.match(/Name\t\t(.*)/i);
            if (gpuNameMatch) data.gpu_model = gpuNameMatch[1].trim();
        }

        // 4. Battery Wear Level
        // Section: Hardware monitor		Battery
        const batterySection = content.split(/Hardware monitor\t\tBattery/i)[1];
        if (batterySection) {
            const wearMatch = batterySection.match(/Level 0\t\t(\d+)\s*pc\s*\[.*\]\s*\(Wear Level\)/i);
            if (wearMatch) data.battery_wear_level = parseInt(wearMatch[1], 10);
        }

        // 5. SSD Health & Model & Capacity
        // Section: Storage
        const storageSection = content.split(/Storage/i)[1];
        if (storageSection) {
            const driveNameMatch = storageSection.match(/Name\t\t(.*)/i);

            const capacityMatch = storageSection.match(/Capacity\t\t([\d.]+)\s*GB/i);
            if (capacityMatch) {
                data.ssd_total_gb = Math.round(parseFloat(capacityMatch[1]));
            }
        }

        // 6. Temperatures 
        // Usually found under the Processor section
        const processorSection = content.split(/Processors Information/i)[1];
        if (processorSection) {
            const tempMatch = processorSection.match(/Temperature 1\t\t(\d+)\s*degC.*\(Cores \(Max\)\)/i) ||
                processorSection.match(/Temperature 0\t\t(\d+)\s*degC.*\(Package\)/i);
            if (tempMatch) data.cpu_temp_max = parseInt(tempMatch[1], 10);
        }

        // 7. RAM - Total Memory Size
        // Search for "Memory" or structure related to it
        const ramMatch = content.match(/Total Memory Size\t\t(\d+)\s*(GB|MB)/i);
        if (ramMatch) {
            let val = parseInt(ramMatch[1], 10);
            if (ramMatch[2].toUpperCase() === 'MB') val = val / 1024;
            data.ram_total_gb = Math.round(val);
        }

    } catch (error) {
        console.error("Error parsing HWMonitor TXT:", error);
    }

    return data;
}
