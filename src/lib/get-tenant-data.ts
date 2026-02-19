import { createAdminClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

export const getTenantData = unstable_cache(
    async () => {
        let whatsappNumber = '5561999999999' // Fallback
        let formattedPhone = '(61) 99999-9999'
        let brandName = 'WFIX Tech' // Fallback Brand adjusted

        try {
            const supabase = await createAdminClient()

            // Buscar tenant padrão diretamente pelo ID (Hardcoded for single tenant app)
            const DEFAULT_TENANT_ID = '8132d666-06c0-46a7-b362-a30393be96c0'

            const { data: tenant, error } = await supabase
                .from('tenants')
                .select('phone, trade_name')
                .eq('id', DEFAULT_TENANT_ID)
                .single()

            if (error) {
                console.error('Erro ao buscar tenant padrão:', error)
            }

            if (tenant) {
                if (tenant.phone) {
                    const cleanPhone = tenant.phone.replace(/\D/g, '')
                    whatsappNumber = `55${cleanPhone}` // Removed trailing space from original
                    formattedPhone = tenant.phone
                }
                if (tenant.trade_name && tenant.trade_name !== 'Minha Assistência') {
                    brandName = tenant.trade_name
                }
            }
        } catch (error) {
            console.error('Erro ao buscar dados da home:', error)
        }

        return { whatsappNumber, formattedPhone, brandName }
    },
    ['tenant-data'],
    { revalidate: 3600, tags: ['tenant'] }
)
