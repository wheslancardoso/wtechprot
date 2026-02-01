import { Suspense } from 'react'
import { getServices } from './actions'
import ServiceList from './service-list'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
    title: 'Catálogo de Serviços | WFIX Tech',
    description: 'Gerenciamento de serviços e preços base para IA',
}

export default async function ServicesPage() {
    const services = await getServices()

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
            {/* Header Mobile Otimizado */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Catálogo de Serviços (IA)</h1>
                <p className="text-muted-foreground">
                    Gerencie os serviços oferecidos e suas faixas de preço.
                    A Inteligência Artificial usará estes dados para sugerir orçamentos baseados na complexidade.
                </p>
            </div>

            <Suspense fallback={<ServicesSkeleton />}>
                <ServiceList initialServices={services} />
            </Suspense>
        </div>
    )
}

function ServicesSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-[300px]" />
                <Skeleton className="h-10 w-[120px]" />
            </div>
            <div className="border rounded-md p-4 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    )
}
