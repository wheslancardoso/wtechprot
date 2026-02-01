'use client'

import dynamic from 'next/dynamic'
import type { OrderData, StoreSettings } from '@/components/warranty-pdf'
import type { TechnicalReport } from '@/types/technical-report'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Dynamic import with SSR disabled
const TechnicalReportPdfButtonBase = dynamic(
    () => import('@/components/technical-report-pdf'),
    {
        ssr: false,
        loading: () => (
            <Button variant="outline" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando PDF...
            </Button>
        )
    }
)

interface TechnicalReportPdfWrapperProps {
    report: TechnicalReport
    orderData: OrderData
    storeSettings: StoreSettings
    label?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export default function TechnicalReportPdfWrapper(props: TechnicalReportPdfWrapperProps) {
    return <TechnicalReportPdfButtonBase {...props} />
}
