'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { reprocessTelemetry } from '@/app/dashboard/orders/actions/telemetry'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReprocessButtonProps {
    telemetryId: string
}

export function ReprocessButton({ telemetryId }: ReprocessButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleReprocess = async () => {
        setLoading(true)
        try {
            const result = await reprocessTelemetry(telemetryId)
            if (result.success) {
                alert('✅ Telemetria reprocessada com sucesso!')
                router.refresh()
            } else {
                alert(`❌ Erro: ${result.error}`)
            }
        } catch (error) {
            alert('❌ Erro ao reprocessar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleReprocess}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
        >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Reprocessando...' : 'Reprocessar Dados'}
        </Button>
    )
}
