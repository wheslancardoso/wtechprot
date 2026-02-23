'use client'

import dynamic from 'next/dynamic'
import type { OrderData, StoreSettings } from '@/components/pdf/warranty-pdf'
import { Button } from '@/components/ui/button'

// Dynamic import para evitar SSR (react-pdf não funciona no server)
const AuditPdfButton = dynamic(
    () => import('@/components/pdf/audit-report-pdf'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center w-full px-2 py-1.5 text-sm opacity-50">
                <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                Carregando Certificado...
            </div>
        )
    }
)

interface AuditReportPdfWrapperProps {
    orderData: OrderData
    storeSettings: StoreSettings
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    icon?: React.ReactNode
}

export default function AuditReportPdfWrapper({ orderData, storeSettings, className, variant, icon }: AuditReportPdfWrapperProps) {
    return <AuditPdfButton orderData={orderData} storeSettings={storeSettings} className={className} variant={variant} icon={icon} />
}
