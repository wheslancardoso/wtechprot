'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Activity, Thermometer, HardDrive, Battery, Gauge } from 'lucide-react'
import type { HardwareTelemetry } from '@/types/telemetry'
import { ReprocessButton } from './reprocess-button'

interface TelemetryDashboardProps {
    telemetry: HardwareTelemetry
}

export function TelemetryDashboard({ telemetry }: TelemetryDashboardProps) {
    const {
        health_score,
        ssd_health_percent,
        ssd_tbw,
        cpu_temp_max,
        battery_cycles,
        battery_wear_level,
        source_type,
        created_at,
        id
    } = telemetry

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

            {/* Hardware Specs (New) */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Gauge className="h-4 w-4" /> Especificações do Hardware
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-xs text-muted-foreground block">Processador (CPU)</span>
                        <span className="font-medium">{telemetry.cpu_model || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Memória RAM</span>
                        <span className="font-medium">{telemetry.ram_total_gb ? `${telemetry.ram_total_gb} GB` : 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Placa Mãe (Motherboard)</span>
                        <span className="font-medium">{telemetry.motherboard_model || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Placa de Vídeo (GPU)</span>
                        <span className="font-medium">{telemetry.gpu_model || 'N/A'}</span>
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
                            <span className="text-xs text-muted-foreground">Saúde Restante</span>
                            <div className={`text-2xl font-bold ${getStatusColor(ssd_health_percent || 0, true, 80, 50)}`}>
                                {ssd_health_percent != null ? `${ssd_health_percent}%` : 'N/A'}
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
