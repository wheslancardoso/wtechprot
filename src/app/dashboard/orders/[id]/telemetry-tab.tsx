import { createAdminClient } from '@/lib/supabase/server'
import { TelemetryUpload } from '@/components/telemetry/telemetry-upload'
import { TelemetryDashboard } from '@/components/telemetry/telemetry-dashboard'
import type { HardwareTelemetry } from '@/types/telemetry'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

interface TelemetryTabProps {
    orderId: string
    equipmentId: string
    tenantId: string
}

export default async function TelemetryTab({ orderId, equipmentId, tenantId }: TelemetryTabProps) {
    const supabase = await createAdminClient()

    // Fetch existing telemetry
    const { data: telemetry } = await supabase
        .from('hardware_telemetry')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single() // We only show the latest snapshot for this order

    // Revalidate helper (handled by server action revalidatePath, 
    // but in case client needs refresh we rely on Next.js cache invalidation)

    return (
        <div className="space-y-8 py-4">
            {telemetry ? (
                <>
                    <TelemetryDashboard telemetry={telemetry as HardwareTelemetry} />

                    <div className="border-t pt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-medium">Nova Análise</h3>
                            <span className="text-sm text-muted-foreground">(Isso substituirá os dados atuais)</span>
                        </div>
                        <TelemetryUpload
                            orderId={orderId}
                            equipmentId={equipmentId}
                            tenantId={tenantId}
                        />
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Nenhum dado de telemetria</AlertTitle>
                        <AlertDescription>
                            Faça upload dos logs do CrystalDiskInfo (.txt), HWiNFO (.csv/.log) ou HWMonitor (.txt).
                        </AlertDescription>
                    </Alert>

                    <TelemetryUpload
                        orderId={orderId}
                        equipmentId={equipmentId}
                        tenantId={tenantId}
                    />
                </div>
            )}
        </div>
    )
}
