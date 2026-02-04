import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'WTECH Solutions | Gestão de TI e Infraestrutura Corporativa',
    description: 'Soluções corporativas de gestão de infraestrutura de TI para pequenas e médias empresas. Reduza custos e aumente produtividade com suporte especializado.',
    robots: 'noindex, nofollow', // Página ponte - não indexar
}

export default function ConsultoriaLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Header Minimalista - Apenas Logo */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center font-bold text-lg border border-slate-600">
                            W
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-100">
                            WTECH <span className="text-slate-400 font-normal">Solutions</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 pt-16">
                {children}
            </main>

            {/* Footer Minimalista - Dados Legais */}
            <footer className="bg-slate-900 border-t border-slate-800 py-10">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-slate-300 font-medium mb-2">
                        WTECH Solutions Corporate - Soluções em Tecnologia
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                        {/* TODO: Inserir CNPJ real abaixo */}
                        CNPJ: 64.928.869/0001-83
                    </p>
                    <p className="text-xs text-slate-600">
                        Atendimento exclusivo para Pessoa Jurídica (PJ)
                    </p>
                    <p className="text-xs text-slate-700 mt-4">
                        © {new Date().getFullYear()} Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    )
}
