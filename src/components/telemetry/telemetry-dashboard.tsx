'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Activity, Thermometer, HardDrive, Battery, Gauge } from 'lucide-react'
import type { HardwareTelemetry } from '@/types/telemetry'
import { ReprocessButton } from './reprocess-button'

interface TelemetryDashboardProps {
    telemetry: HardwareTelemetry[]
}

export function TelemetryDashboard({ telemetry: allTelemetry }: TelemetryDashboardProps) {
    if (!allTelemetry || allTelemetry.length === 0) return null;

    // Sort by date to always get the most recent values first
    const sortedTelemetry = [...allTelemetry].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Latest telemetry record for primary metadata (ID, Source Type, Created At)
    const latest = sortedTelemetry[0];

    // Aggregate hardware specs and metrics from all records (find the latest non-null value)
    const aggregated = {
        cpu_model: sortedTelemetry.find(t => t.cpu_model)?.cpu_model,
        motherboard_model: sortedTelemetry.find(t => t.motherboard_model)?.motherboard_model,
        ram_total_gb: sortedTelemetry.find(t => t.ram_total_gb)?.ram_total_gb,
        ram_speed: sortedTelemetry.find(t => t.ram_speed != null)?.ram_speed,
        ram_slots: sortedTelemetry.find(t => t.ram_slots != null)?.ram_slots,
        gpu_model: sortedTelemetry.find(t => t.gpu_model)?.gpu_model,

        // Dynamic metrics - Aggregate across all files to avoid "hiding" data
        ssd_health_percent: sortedTelemetry.find(t => t.ssd_health_percent != null)?.ssd_health_percent,
        ssd_total_gb: sortedTelemetry.find(t => t.ssd_total_gb != null)?.ssd_total_gb,
        ssd_tbw: sortedTelemetry.find(t => t.ssd_tbw != null)?.ssd_tbw,
        cpu_temp_max: sortedTelemetry.find(t => t.cpu_temp_max != null)?.cpu_temp_max,
        battery_cycles: sortedTelemetry.find(t => t.battery_cycles != null)?.battery_cycles,
        battery_wear_level: sortedTelemetry.find(t => t.battery_wear_level != null)?.battery_wear_level,
        health_score: latest.health_score // Main score should reflect the overall health if possible
    };

    const {
        source_type,
        created_at,
        id
    } = latest;

    const cpu_temp_max = aggregated.cpu_temp_max;
    const health_score = aggregated.health_score;

    // Use aggregated data for specs that are less likely to change between stages
    const ssd_health_percent = aggregated.ssd_health_percent;
    const ssd_tbw = aggregated.ssd_tbw;
    const battery_cycles = aggregated.battery_cycles;
    const battery_wear_level = aggregated.battery_wear_level;

    // Helper for Status Colors
    const getStatusColor = (val: number, goodAbove: boolean, warnLimit: number, critLimit: number) => {
        if (goodAbove) {
            if (val >= warnLimit) return 'text-green-500'
            if (val >= critLimit) return 'text-yellow-500'
            return 'text-red-500'
        } else {
            // Lower is better (e.g. Temp/Wear)
            if (val <= warnLimit) return 'text-green-500'
            if (val <= critLimit) return 'text-yellow-500'
            return 'text-red-500'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="uppercase">{source_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                        Analisado em {new Date(created_at).toLocaleString()}
                    </span>
                </div>
                <ReprocessButton telemetryId={id} />
            </div>

            {/* Health Score Overview */}
            <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Health Score Geral
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="text-5xl font-bold tracking-tighter">
                            {health_score ?? '--'}
                            <span className="text-lg text-muted-foreground font-normal ml-1">/100</span>
                        </div>
                        <Progress value={health_score || 0} className="mb-2 h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Hardware Specs (Aggregated) */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Gauge className="h-4 w-4" /> Especificações do Hardware
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-xs text-muted-foreground block">Processador (CPU)</span>
                        <span className="font-medium">{aggregated.cpu_model || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Memória RAM</span>
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {aggregated.ram_total_gb ? `${aggregated.ram_total_gb} GB` : 'N/A'}
                            </span>
                            {(aggregated.ram_speed || aggregated.ram_slots) && (
                                <span className="text-[10px] text-muted-foreground leading-tight">
                                    {aggregated.ram_speed ? `${aggregated.ram_speed} MHz` : ''}
                                    {aggregated.ram_slots ? ` (${aggregated.ram_slots} slot${aggregated.ram_slots > 1 ? 's' : ''})` : ''}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Placa Mãe (Motherboard)</span>
                        <span className="font-medium">{aggregated.motherboard_model || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Placa de Vídeo (GPU)</span>
                        <span className="font-medium">{aggregated.gpu_model || 'N/A'}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* SSD Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <HardDrive className="h-4 w-4" /> Armazenamento (SSD/HD)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                                {aggregated.ssd_total_gb ? `Capacidade: ${aggregated.ssd_total_gb} GB` : 'Saúde Restante'}
                            </span>
                            <div className={`text-2xl font-bold ${getStatusColor(ssd_health_percent || 0, true, 80, 50)}`}>
                                {ssd_health_percent != null ? `${ssd_health_percent}%` : 'N/A'}
                                {aggregated.ssd_total_gb && <span className="text-xs font-normal ml-2 text-muted-foreground">Saúde</span>}
                            </div>
                            {ssd_tbw && (
                                <span className="text-xs text-muted-foreground mt-1">TBW: {ssd_tbw} TB</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Thermals Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Thermometer className="h-4 w-4" /> Temperatura (Máx)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Pico Registrado</span>
                            <div className={`text-2xl font-bold ${getStatusColor(cpu_temp_max || 0, false, 75, 90)}`}>
                                {cpu_temp_max != null ? `${cpu_temp_max}°C` : 'N/A'}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                                {cpu_temp_max && cpu_temp_max > 90 ? 'Crítico (Thermal Throttling)' : 'Dentro do limite'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Battery Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Battery className="h-4 w-4" /> Bateria
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Nível de Desgaste (Wear)</span>
                            <div className={`text-2xl font-bold ${getStatusColor(battery_wear_level || 0, false, 20, 50)}`}>
                                {battery_wear_level != null ? `${battery_wear_level}%` : 'N/A'}
                            </div>
                            {battery_cycles && (
                                <span className="text-xs text-muted-foreground mt-1">Ciclos: {battery_cycles}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
