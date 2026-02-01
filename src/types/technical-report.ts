export interface TechnicalReport {
    id: string
    order_id: string
    tenant_id: string
    technical_analysis: string
    tests_performed: string[]
    conclusion: string
    photos_evidence: string[]
    pdf_url?: string | null
    created_at: string
}

export type TechnicalReportFormData = Omit<TechnicalReport, 'id' | 'created_at' | 'tenant_id' | 'order_id'>

export interface TechnicalReportPdfProps {
    report: TechnicalReport
    order: any // Type this properly if possible, reusing OrderData
    settings: any // Reusing StoreSettings
}
