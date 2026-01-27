'use client'

import dynamic from 'next/dynamic'
import type { OrderData } from '@/components/warranty-pdf'

// Dynamic import para evitar SSR (react-pdf não funciona no server)
const WarrantyPdfButton = dynamic(
    () => import('@/components/warranty-pdf'),
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
    storeSettings: any // Usando any temporariamente para evitar conflito de importação circular ou duplicada, idealmente importar de warranty-pdf
}

export default function PdfButtonWrapper({ orderData, storeSettings }: PdfButtonWrapperProps) {
    return <WarrantyPdfButton orderData={orderData} storeSettings={storeSettings} />
}
