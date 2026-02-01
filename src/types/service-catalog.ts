export interface ServiceCatalogItem {
    id: string
    tenant_id: string
    name: string
    description: string
    price_min: number
    price_max: number
    category: string
    active: boolean
    created_at: string
}

export type NewServiceCatalogItem = Omit<ServiceCatalogItem, 'id' | 'created_at' | 'tenant_id'>

export interface ServiceCatalogState {
    errors?: {
        name?: string[]
        description?: string[]
        price_min?: string[]
        price_max?: string[]
        category?: string[]
        _form?: string[]
    }
    message?: string
}
