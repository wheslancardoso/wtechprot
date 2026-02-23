'use client'

import dynamic from 'next/dynamic'
import type { OrderData } from '@/components/pdf/warranty-pdf'

// Dynamic import para evitar SSR (react-pdf não funciona no server)
const WarrantyPdfButton = dynamic(
    () => import('@/components/pdf/warranty-pdf'),
    {
        ssr: false,
        loading: () => (
            <button className="inline-flex items-center px-4 py-2 border rounded-md text-sm opacity-50" disabled>
                Carregando PDF...
            </button>
        )
    }
)

interface PdfButtonWrapperProps {
    orderData: OrderData
    storeSettings: any
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    icon?: React.ReactNode
}

export default function PdfButtonWrapper({ orderData, storeSettings, className, variant, icon }: PdfButtonWrapperProps) {
    return <WarrantyPdfButton orderData={orderData} storeSettings={storeSettings} className={className} variant={variant} icon={icon} />
}
