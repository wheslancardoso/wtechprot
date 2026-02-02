'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Activity, Thermometer, HardDrive, Battery, Gauge, Monitor } from 'lucide-react'
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
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-background">
                                {source_type}
                            </Badge>
                            <span className="text-[10px] md:text-xs text-muted-foreground font-medium">
                                Analisado em {new Date(created_at).toLocaleString('pt-BR')}
                            </span>
                        </div>
                        <h2 className="text-sm font-semibold mt-0.5">Relatório de Saúde do Hardware</h2>
                    </div>
                </div>
                <div className="flex justify-end">
                    <ReprocessButton telemetryId={id} />
                </div>
            </div>

            {/* Health Score Overview */}
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                        <Gauge className="h-4 w-4" />
                        Health Score Geral
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-black tracking-tighter bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
                                {health_score ?? '--'}
                            </span>
                            <span className="text-xl text-muted-foreground font-medium">/100</span>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                <span>Estado do Sistema</span>
                                <span className={getStatusColor(health_score || 0, true, 80, 50).replace('text-', 'bg-').replace('500', '100') + ' ' + getStatusColor(health_score || 0, true, 80, 50) + ' px-2 rounded-full'}>
                                    {health_score && health_score >= 80 ? 'Excelente' : health_score && health_score >= 50 ? 'Bom' : health_score ? 'Crítico' : 'N/A'}
                                </span>
                            </div>
                            <Progress value={health_score || 0} className="h-4 rounded-full bg-primary/10" />
                            <p className="text-[11px] text-muted-foreground leading-snug">
                                {health_score && health_score >= 80
                                    ? 'Todos os componentes críticos operando dentro das especificações ideais.'
                                    : health_score && health_score >= 50
                                        ? 'Atenção necessária em pontos específicos de desempenho ou temperatura.'
                                        : 'Intervenção técnica imediata recomendada para evitar falha de hardware.'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Hardware Specs (Aggregated) */}
            <Card className="border-border/60 shadow-none bg-muted/5">
                <CardHeader className="pb-3 border-b bg-muted/20">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                        <Monitor className="h-3.5 w-3.5" /> Ficha Técnica do Equipamento
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 p-0 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40">
                        <div className="p-4 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">CPU</span>
                            <span className="text-sm font-semibold line-clamp-2 leading-tight">{aggregated.cpu_model || 'N/A'}</span>
                        </div>
                        <div className="p-4 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Memória RAM</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold">
                                    {aggregated.ram_total_gb ? `${aggregated.ram_total_gb} GB` : 'N/A'}
                                </span>
                                {(aggregated.ram_speed || aggregated.ram_slots) && (
                                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                        {aggregated.ram_speed ? `${aggregated.ram_speed}MHz` : ''}
                                        {aggregated.ram_slots ? ` [${aggregated.ram_slots} slot${aggregated.ram_slots > 1 ? 's' : ''}]` : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40">
                        <div className="p-4 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Placa Mãe</span>
                            <span className="text-sm font-semibold truncate leading-tight">{aggregated.motherboard_model || 'N/A'}</span>
                        </div>
                        <div className="p-4 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">GPU</span>
                            <span className="text-sm font-semibold truncate leading-tight">{aggregated.gpu_model || 'N/A'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* SSD Card */}
                <Card className="relative overflow-hidden group border-border/60 hover:border-primary/30 transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <HardDrive className="h-12 w-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                            <HardDrive className="h-3.5 w-3.5 text-blue-500" /> Armazenamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <div className={`text-3xl font-black ${getStatusColor(ssd_health_percent || 0, true, 80, 50)}`}>
                                {ssd_health_percent != null ? `${ssd_health_percent}%` : 'N/A'}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{aggregated.ssd_total_gb ? `${aggregated.ssd_total_gb}GB` : 'SSD'}</span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-medium">
                                <span className="text-muted-foreground">Saúde do Drive</span>
                                <span className="font-bold">{ssd_health_percent ?? 0}%</span>
                            </div>
                            <Progress
                                value={ssd_health_percent || 0}
                                className={`h-1.5 ${ssd_health_percent != null && ssd_health_percent < 50 ? 'bg-red-100' : 'bg-blue-100'}`}
                            />
                        </div>
                        {ssd_tbw && (
                            <div className="pt-2 border-t flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Bytes Written</span>
                                <span className="text-[11px] font-mono font-bold text-blue-600">{ssd_tbw} TB</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Thermals Card */}
                <Card className="relative overflow-hidden group border-border/60 hover:border-primary/30 transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Thermometer className="h-12 w-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                            <Thermometer className="h-3.5 w-3.5 text-orange-500" /> Stress Térmico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <div className={`text-3xl font-black ${getStatusColor(cpu_temp_max || 0, false, 75, 90)}`}>
                                {cpu_temp_max != null ? `${cpu_temp_max}°C` : 'N/A'}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Peak Package</span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-medium">
                                <span className="text-muted-foreground">Limite Térmico</span>
                                <span className="font-bold">100°C</span>
                            </div>
                            <Progress
                                value={cpu_temp_max || 0}
                                className={`h-1.5 ${cpu_temp_max != null && cpu_temp_max > 85 ? 'bg-orange-100' : 'bg-green-100'}`}
                            />
                        </div>
                        <div className="pt-2 border-t text-[10px] font-bold flex items-center gap-2 uppercase tracking-tighter">
                            <div className={`w-2 h-2 rounded-full ${cpu_temp_max && cpu_temp_max > 90 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            {cpu_temp_max && cpu_temp_max > 90 ? 'Crítico (Thermal Throttling)' : 'Estabilidade Térmica OK'}
                        </div>
                    </CardContent>
                </Card>

                {/* Battery Card */}
                <Card className="relative overflow-hidden group border-border/60 hover:border-primary/30 transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Battery className="h-12 w-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                            <Battery className="h-3.5 w-3.5 text-green-500" /> Bateria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <div className={`text-3xl font-black ${getStatusColor(battery_wear_level || 0, false, 20, 50)}`}>
                                {battery_wear_level != null ? `${battery_wear_level}%` : 'N/A'}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Desgaste</span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-medium">
                                <span className="text-muted-foreground">Ciclos de Carga</span>
                                <span className="font-bold">{battery_cycles ?? 'N/A'}</span>
                            </div>
                            <div className="flex gap-1 h-1.5">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-sm ${battery_wear_level != null && (100 - battery_wear_level) >= i * 10 ? 'bg-green-500' : 'bg-muted'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="pt-2 border-t flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                            <span className="text-muted-foreground">Saúde Química</span>
                            <span className={battery_wear_level != null && battery_wear_level > 30 ? 'text-red-500' : 'text-green-500'}>
                                {battery_wear_level != null && battery_wear_level > 30 ? 'Degradação Notável' : 'Saúde Excelente'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
