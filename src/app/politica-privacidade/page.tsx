import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Política de Privacidade | WTECH',
    description: 'Política de Privacidade da WTECH - Assistência técnica especializada em computadores, notebooks e impressoras.',
}

export default function PoliticaPrivacidadePage() {
    return (
        <div className="dark min-h-screen bg-slate-950 text-slate-50">
            <div className="container mx-auto px-4 py-16 max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Voltar ao início
                </Link>

                <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>

                <div className="prose prose-invert prose-slate max-w-none space-y-6">
                    <p className="text-slate-400">
                        Última atualização: Fevereiro de 2026
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">1. Informações que coletamos</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Coletamos informações que você nos fornece diretamente, como nome, telefone, e-mail e dados sobre seu equipamento quando você solicita um orçamento ou serviço de assistência técnica.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">2. Como usamos suas informações</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Utilizamos suas informações para:
                        </p>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                            <li>Prestar os serviços de assistência técnica solicitados</li>
                            <li>Entrar em contato sobre o andamento do seu equipamento</li>
                            <li>Enviar orçamentos e documentação relacionada ao serviço</li>
                            <li>Melhorar nossos serviços e atendimento</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">3. Proteção dos seus dados</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Adotamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">4. Compartilhamento de informações</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. Podemos compartilhar informações quando necessário para a prestação do serviço (ex: envio de peças) ou quando exigido por lei.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">5. Seus direitos</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento entrando em contato conosco através dos canais disponíveis em nosso site.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">6. Contato</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Para dúvidas sobre esta Política de Privacidade, entre em contato através do WhatsApp disponível em nosso site.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-sm text-slate-500">
                    <p>WTECH - CNPJ: 64.928.869/0001-83</p>
                </div>
            </div>
        </div>
    )
}
