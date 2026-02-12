import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Termos de Uso',
    description: 'Termos de Uso da WFIX Tech - Soluções em Gestão de TI e Consultoria Corporativa.',
}

export default function TermosUsoPage() {
    return (
        <div className="dark min-h-screen bg-slate-950 text-slate-50">
            <div className="container mx-auto px-4 py-16 max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Voltar ao início
                </Link>

                <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>

                <div className="prose prose-invert prose-slate max-w-none space-y-6">
                    <p className="text-slate-400">
                        Última atualização: Fevereiro de 2026
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">1. Aceitação dos Termos</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Ao utilizar nossos serviços de gestão e suporte de TI, você concorda com estes Termos de Uso. Se não concordar com algum termo, recomendamos que não utilize nossos serviços.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">2. Serviços Oferecidos</h2>
                        <p className="text-slate-300 leading-relaxed">
                            A WFIX Tech oferece serviços de gestão de ativos para computadores, notebooks e impressoras, incluindo diagnóstico, monitoramento, suporte técnico e atualização de infraestrutura.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">3. Propostas e Validação</h2>
                        <p className="text-slate-300 leading-relaxed">
                            As propostas comerciais são enviadas por meios digitais e devem ser aprovadas antes da execução do serviço. O cliente acompanha o andamento através do sistema de rastreamento online.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">4. Garantia</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Os serviços prestados possuem garantia conforme especificado no termo de garantia emitido junto com a ordem de serviço. A garantia cobre defeitos relacionados ao serviço realizado.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">5. Responsabilidades do Cliente</h2>
                        <p className="text-slate-300 leading-relaxed">
                            O cliente é responsável por fornecer informações corretas sobre o equipamento e a solicitação, assim como realizar backup de seus dados antes de entregar o equipamento para análise técnica.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">6. Pagamento</h2>
                        <p className="text-slate-300 leading-relaxed">
                            O pagamento é realizado no momento da entrega/conclusão. Aceitamos diversas formas de pagamento conforme informado na proposta comercial.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">7. Alterações nos Termos</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após sua publicação nesta página.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">8. Contato</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Para dúvidas sobre estes Termos de Uso, entre em contato através do WhatsApp disponível em nosso site.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-sm text-slate-500">
                    <p>WFIX Tech - CNPJ: 64.928.869/0001-83</p>
                </div>
            </div>
        </div>
    )
}
