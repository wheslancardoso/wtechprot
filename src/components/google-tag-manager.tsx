'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

// Rotas onde o GTM DEVE ser carregado (vitrine/ads)
const ALLOWED_ROUTES = ['/', '/consultoria-para-empresas']

export function GoogleTagManager() {
    const pathname = usePathname()

    // Verifica se está em rota permitida
    const isAllowedRoute = ALLOWED_ROUTES.includes(pathname)

    // Não renderiza GTM em rotas não permitidas
    if (!isAllowedRoute) {
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

    // Verifica se está em rota permitida
    const isAllowedRoute = ALLOWED_ROUTES.includes(pathname)

    // Não renderiza GTM em rotas não permitidas
    if (!isAllowedRoute) {
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
