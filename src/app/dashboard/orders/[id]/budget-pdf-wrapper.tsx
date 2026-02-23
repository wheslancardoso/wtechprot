'use client'

import dynamic from 'next/dynamic'
import type { BudgetData, BudgetStoreSettings } from '@/components/budget-pdf'

const BudgetPdfButton = dynamic(
    () => import('@/components/budget-pdf'),
    { ssr: false }
)

interface BudgetPdfWrapperProps {
    budgetData: BudgetData
    storeSettings: BudgetStoreSettings
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    icon?: React.ReactNode
}

export default function BudgetPdfWrapper(props: BudgetPdfWrapperProps) {
    return <BudgetPdfButton {...props} />
}
