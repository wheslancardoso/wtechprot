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
        const isDiffCard = label.toLowerCase().includes('diferença') || label.toLowerCase().includes('final')

        if (numValue === undefined || numValue === null) {
            if (!isDiffCard || diff === null || diff === undefined) return null
        }

        const getDeltaStatus = (val: number) => {
            if (val === 0) return { color: 'text-gray-500', icon: Minus, sign: '' }
            const isGood = isBetterLower ? val < 0 : val > 0
            return {
                color: isGood ? 'text-green-500' : 'text-red-500',
                icon: val > 0 ? TrendingUp : TrendingDown,
                sign: val > 0 ? '+' : ''
            }
        }

        const delta = diff
        const deltaStatus = delta !== null && delta !== undefined ? getDeltaStatus(delta) : null

        return (
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card/50">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                    {stage && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                            {stage === 'initial' && 'Diagnóstico'}
                            {stage === 'post_repair' && 'Pós-Reparo'}
                            {stage === 'final' && 'Relatório'}
                        </Badge>
                    )}
                </div>
                <div className="flex items-baseline gap-2">
                    {isDiffCard && delta !== null && delta !== undefined && deltaStatus ? (
                        <div className="flex items-center gap-2">
                            <deltaStatus.icon className={`h-6 w-6 ${deltaStatus.color}`} />
                            <div className="flex flex-col">
                                <span className={`text-2xl font-bold ${deltaStatus.color}`}>
                                    {deltaStatus.sign}{(delta !== null && delta !== undefined) ? delta.toFixed(delta < 1 && delta !== 0 ? 3 : 1).replace('.0', '') : ''}{unit}
                                </span>
                                {value && (
                                    <span className="text-[10px] text-muted-foreground font-medium">Final: {value}{unit}</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <span className="text-2xl font-bold">{value}{unit}</span>
                            {deltaStatus && (
                                <div className="flex items-center gap-1">
                                    <deltaStatus.icon className={`h-4 w-4 ${deltaStatus.color}`} />
                                    <span className={`text-sm font-medium ${deltaStatus.color}`}>
                                        {deltaStatus.sign}{(delta !== null && delta !== undefined) ? delta.toFixed(delta < 1 && delta !== 0 ? 3 : 1).replace('.0', '') : ''}{unit}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <Card className="border-border/60 shadow-none overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 text-primary bg-muted/20 border-b">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Evolução Térmica (CPU)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderMetricCard('Inicial', initialTemp, '°C', undefined, 'initial')}
                        {renderMetricCard('Pós-Reparo', postRepairTemp, '°C', postRepairDiff, 'post_repair')}
                        {renderMetricCard('Diferença Final', finalTemp ?? postRepairTemp, '°C', finalDiff ?? postRepairDiff, final ? 'final' : 'post_repair')}
                    </div>

                    {(postRepairDiff !== null && postRepairDiff < 0) && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold flex items-center gap-3 border border-green-100 dark:border-green-900/50">
                            <div className="bg-green-500 rounded-full p-1">
                                <TrendingDown className="h-3 w-3 text-white" />
                            </div>
                            <span>Otimização Eficiente: Redução de {Math.abs(postRepairDiff)}°C após intervenção técnica.</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {(initialSSD || initialTBW) && (
                <Card className="border-border/60 shadow-none overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 text-blue-500 bg-muted/20 border-b">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            Saúde e Escrita (SSD)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderMetricCard('Saúde Inicial', initialSSD, '%', undefined, 'initial', false)}
                            {renderMetricCard('Uso (TBW)', initialTBW, ' TB', tbwDiff, 'post_repair', true)}
                        </div>
                        {tbwDiff !== null && tbwDiff > 0 && (
                            <p className="mt-4 text-[10px] text-muted-foreground italic font-medium px-2 py-1 bg-muted/50 rounded inline-block">
                                * Escrita acumulada: +{tbwDiff.toFixed(3)} TB registrados durante os ciclos de trabalho e testes.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
