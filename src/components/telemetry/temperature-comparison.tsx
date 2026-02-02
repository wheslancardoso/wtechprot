'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp, Minus, Thermometer } from 'lucide-react'
import { HardwareTelemetry } from '@/types/telemetry'

interface TemperatureComparisonProps {
    telemetryData: HardwareTelemetry[]
}

export function TemperatureComparison({ telemetryData }: TemperatureComparisonProps) {
    // Group telemetry by stage
    const initial = telemetryData.find(t => t.stage === 'initial')
    const postRepair = telemetryData.find(t => t.stage === 'post_repair')
    const final = telemetryData.find(t => t.stage === 'final')

    // Calculate temperature difference
    const getTempDiff = (before?: number, after?: number) => {
        if (!before || !after) return null
        return after - before
    }

    const initialTemp = initial?.cpu_temp_max
    const postRepairTemp = postRepair?.cpu_temp_max
    const finalTemp = final?.cpu_temp_max

    const postRepairDiff = getTempDiff(initialTemp, postRepairTemp)
    const finalDiff = getTempDiff(initialTemp, finalTemp)

    const renderTempCard = (label: string, temp?: number, diff?: number | null, stage?: string) => {
        if (!temp) return null

        return (
            <div className="flex flex-col gap-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                    {stage && (
                        <Badge variant="outline" className="text-xs">
                            {stage === 'initial' && 'Diagnóstico'}
                            {stage === 'post_repair' && 'Pós-Reparo'}
                            {stage === 'final' && 'Final'}
                        </Badge>
                    )}
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{temp}°C</span>
                    {diff !== null && diff !== undefined && (
                        <div className="flex items-center gap-1">
                            {diff < 0 ? (
                                <>
                                    <TrendingDown className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-medium text-green-500">
                                        {Math.abs(diff)}°C
                                    </span>
                                </>
                            ) : diff > 0 ? (
                                <>
                                    <TrendingUp className="h-4 w-4 text-red-500" />
                                    <span className="text-sm font-medium text-red-500">
                                        +{diff}°C
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Minus className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-500">
                                        Sem mudança
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // If no temperature data at all, don't render
    if (!initialTemp && !postRepairTemp && !finalTemp) {
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Comparação de Temperatura
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderTempCard('Diagnóstico Inicial', initialTemp, undefined, 'initial')}
                    {renderTempCard('Pós-Reparo', postRepairTemp, postRepairDiff, 'post_repair')}
                    {renderTempCard('Entrega Final', finalTemp, finalDiff, 'final')}
                </div>

                {(postRepairDiff !== null || finalDiff !== null) && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            {postRepairDiff && postRepairDiff < 0 && (
                                <span className="text-green-600 font-medium">
                                    ✓ Temperatura reduziu {Math.abs(postRepairDiff)}°C após o reparo
                                </span>
                            )}
                            {finalDiff && finalDiff < 0 && (
                                <span className="text-green-600 font-medium block mt-1">
                                    ✓ Melhoria total de {Math.abs(finalDiff)}°C desde o diagnóstico inicial
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
