'use client'

import dynamic from 'next/dynamic'
import type { OrderData, StoreSettings } from '@/components/warranty-pdf'

// Dynamic import para evitar SSR (react-pdf não funciona no server)
const DeliveryReceiptPdfButton = dynamic(
    () => import('@/components/delivery-receipt-pdf'),
    {
        ssr: false,
        loading: () => (
            <button className="inline-flex items-center px-4 py-2 border rounded-md text-sm opacity-50" disabled>
                Carregando PDF...
            </button>
        )
    }
)

interface DeliveryReceiptPdfWrapperProps {
    orderData: OrderData
    storeSettings: StoreSettings
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    icon?: React.ReactNode
}

export default function DeliveryReceiptPdfWrapper({ orderData, storeSettings, className, variant, icon }: DeliveryReceiptPdfWrapperProps) {
    return <DeliveryReceiptPdfButton orderData={orderData} storeSettings={storeSettings} className={className} variant={variant} icon={icon} />
}
