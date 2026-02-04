'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

// Rotas operacionais onde o GTM NÃO deve ser carregado
const OPERATIONAL_ROUTES = ['/dashboard', '/os/', '/login', '/signup']

export function GoogleTagManager() {
    const pathname = usePathname()

    // Verifica se está em rota operacional
    const isOperationalRoute = OPERATIONAL_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    // Não renderiza GTM em rotas operacionais
    if (isOperationalRoute) {
        return null
    }

    return (
        <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5FG7HKVH');`
            }}
        />
    )
}

export function GoogleTagManagerNoScript() {
    const pathname = usePathname()

    const isOperationalRoute = OPERATIONAL_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    if (isOperationalRoute) {
        return null
    }

    return (
        <noscript>
            <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-5FG7HKVH"
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
            />
        </noscript>
    )
}
