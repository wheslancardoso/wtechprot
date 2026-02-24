import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTenantData } from '@/lib/get-tenant-data'

export const metadata: Metadata = {
    title: 'WFIX Tech Empresas | Gestão de TI e Infraestrutura',
    description: 'Soluções de Tecnologia para pequenos negócios. Gestão de hardware, manutenção preventiva e infraestrutura de redes.',
}

export default async function B2BLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { whatsappNumber, formattedPhone } = await getTenantData()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
            {/* Simple Header for B2B Trust */}
            <header className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="font-bold text-xl tracking-tight">
                            <span className="text-primary">WFIX </span>
                            <span className="text-slate-900 dark:text-white">Tech</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider font-bold border border-slate-200 dark:border-slate-700">Empresas</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <a href="#vantagens" className="hover:text-primary transition-colors">Vantagens</a>
                        <a href="#servicos" className="hover:text-primary transition-colors">Soluções</a>

                        <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                            <a href={`https://api.whatsapp.com/send?phone=${whatsappNumber}`} target="_blank" className="flex items-center gap-2 hover:text-green-500 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span>{formattedPhone}</span>
                            </a>
                            <Button size="sm" className="font-bold rounded-full" asChild>
                                <a href="#contato">Falar com Consultor</a>
                            </Button>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="pt-16">
                {children}
            </main>

            <footer className="py-12 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <span className="text-primary font-extrabold text-xl block mb-4">WFIX Tech Empresas</span>
                        <p className="max-w-xs mb-4">Parceiro estratégico de tecnologia para pequenos negócios. Da estabilidade dos computadores à infraestrutura.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Soluções</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-primary">Gestão de Equipamentos</a></li>
                            <li><a href="#" className="hover:text-primary">Suporte de Hardware</a></li>
                            <li><a href="#" className="hover:text-primary">Redes & Wi-Fi</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Atendimento</h4>
                        <ul className="space-y-2">
                            <li>Segunda a Sexta: 08h às 18h</li>
                            <li>Sábado: 08h às 12h</li>
                            <li>wfixtech.contato@gmail.com</li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
                    <p>&copy; {new Date().getFullYear()} WFIX Tech. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
