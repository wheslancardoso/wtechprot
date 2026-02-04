import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'WTECH Solutions | Consultoria em TI e Gestão de Infraestrutura',
    description: 'Soluções corporativas de TI, gestão de ativos e infraestrutura de hardware para empresas. Suporte especializado com foco em continuidade e redução de custos.',
    robots: 'noindex, nofollow', // Não indexar esta página ponte
}

export default function ConsultoriaLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Header Isolado */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-bold text-lg">
                            W
                        </div>
                        <span className="font-bold text-xl tracking-tight">
                            WTECH <span className="text-blue-400">Solutions</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span className="font-medium">(62) 99451-6025</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 pt-16">
                {children}
            </main>

            {/* Footer Isolado */}
            <footer className="bg-slate-900 border-t border-slate-800 py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} WTECH Corporate. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                        CNPJ: XX.XXX.XXX/0001-XX | Soluções em Tecnologia da Informação
                    </p>
                </div>
            </footer>
        </div>
    )
}
