'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp, Minus, Thermometer, HardDrive } from 'lucide-react'
import { HardwareTelemetry } from '@/types/telemetry'

interface TemperatureComparisonProps {
    telemetryData: HardwareTelemetry[]
}

export function TemperatureComparison({ telemetryData }: TemperatureComparisonProps) {
    // Aggregate metrics per stage
    const aggregateStage = (stage: string) => {
        const stageRecords = telemetryData
            .filter(t => t.stage === stage)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (stageRecords.length === 0) return null;

        return {
            cpu_temp_max: stageRecords.find(t => t.cpu_temp_max != null)?.cpu_temp_max,
            ssd_health_percent: stageRecords.find(t => t.ssd_health_percent != null)?.ssd_health_percent,
            ssd_tbw: stageRecords.find(t => t.ssd_tbw != null)?.ssd_tbw,
            created_at: stageRecords[0].created_at
        };
    };

    const initial = aggregateStage('initial');
    const postRepair = aggregateStage('post_repair');
    const final = aggregateStage('final');

    // Analysis for Temperatures
    const getDiff = (before?: number, after?: number) => {
        if (before === undefined || after === undefined || before === null || after === null) return null
        return after - before
    }

    const initialTemp = initial?.cpu_temp_max
    const postRepairTemp = postRepair?.cpu_temp_max
    const finalTemp = final?.cpu_temp_max
    const postRepairDiff = getDiff(initialTemp, postRepairTemp)
    const finalDiff = getDiff(initialTemp, finalTemp)

    // Analysis for SSD Health/Degradation
    const initialSSD = initial?.ssd_health_percent
    const finalSSD = (final || postRepair)?.ssd_health_percent
    const ssdDiff = getDiff(initialSSD, finalSSD)

    const initialTBW = initial?.ssd_tbw
    const finalTBW = (final || postRepair)?.ssd_tbw
    const tbwDiff = getDiff(Number(initialTBW), Number(finalTBW))

    const renderMetricCard = (label: string, value?: number | string, unit: string = '°C', diff?: number | null, stage?: string, isBetterLower: boolean = true) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value
        if (numValue === undefined || numValue === null) return null

        return (
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card/50">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                    {stage && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                            {stage === 'initial' && 'Diagnóstico'}
                            {stage === 'post_repair' && 'Pós-Reparo'}
                            {stage === 'final' && 'Final'}
                        </Badge>
                    )}
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{value}{unit}</span>
                    {diff !== null && diff !== undefined && (
                        <div className="flex items-center gap-1">
                            {((diff < 0 && isBetterLower) || (diff > 0 && !isBetterLower)) ? (
                                <>
                                    <TrendingDown className={`h-4 w-4 ${isBetterLower ? 'text-green-500' : 'text-red-500'}`} />
                                    <span className={`text-sm font-medium ${isBetterLower ? 'text-green-500' : 'text-red-500'}`}>
                                        {Math.abs(diff)}{unit}
                                    </span>
                                </>
                            ) : ((diff > 0 && isBetterLower) || (diff < 0 && !isBetterLower)) ? (
                                <>
                                    <TrendingUp className={`h-4 w-4 ${isBetterLower ? 'text-red-500' : 'text-green-500'}`} />
                                    <span className={`text-sm font-medium ${isBetterLower ? 'text-red-500' : 'text-green-500'}`}>
                                        {diff > 0 ? '+' : ''}{diff}{unit}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Minus className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-500">
                                        =
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3 text-primary">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Thermometer className="h-5 w-5" />
                        Evolução Térmica (CPU)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderMetricCard('Inicial', initialTemp, '°C', undefined, 'initial')}
                        {renderMetricCard('Pós-Reparo', postRepairTemp, '°C', postRepairDiff, 'post_repair')}
                        {renderMetricCard('Diferença Final', finalTemp || postRepairTemp, '°C', finalDiff || postRepairDiff, final ? 'final' : 'post_repair')}
                    </div>

                    {(postRepairDiff !== null && postRepairDiff < 0) && (
                        <div className="mt-4 p-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded text-xs font-medium flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" />
                            Redução de {Math.abs(postRepairDiff)}°C na temperatura máxima após intervenção técnica.
                        </div>
                    )}
                </CardContent>
            </Card>

            {(initialSSD || initialTBW) && (
                <Card>
                    <CardHeader className="pb-3 text-blue-500">
                        <CardTitle className="text-base flex items-center gap-2">
                            <HardDrive className="h-5 w-5" />
                            Saúde e Escrita (SSD)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderMetricCard('Saúde Inicial', initialSSD, '%', undefined, 'initial', false)}
                            {renderMetricCard('Uso (TBW)', initialTBW, ' TB', tbwDiff, 'post_repair', true)}
                        </div>
                        {tbwDiff !== null && tbwDiff > 0 && (
                            <p className="mt-4 text-[10px] text-muted-foreground italic">
                                * O TBW aumentou {tbwDiff.toFixed(3)} TB durante os testes e formatação.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
