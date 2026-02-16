import Link from 'next/link'
import { ArrowLeft, Monitor, Laptop, Wifi, Headset, CheckCircle2, ArrowRight, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

// Agrupando dados do tenant para consistência com a home
const getTenantData = unstable_cache(
    async () => {
        let whatsappNumber = '5561999999999' // Fallback
        let formattedPhone = '(61) 99999-9999'
        let brandName = 'WFIX Tech'

        try {
            const supabase = await createAdminClient()
            const DEFAULT_TENANT_ID = '8132d666-06c0-46a7-b362-a30393be96c0'
            const { data: tenant } = await supabase
                .from('tenants')
                .select('phone, trade_name')
                .eq('id', DEFAULT_TENANT_ID)
                .single()

            if (tenant) {
                if (tenant.phone) {
                    whatsappNumber = tenant.phone.replace(/\D/g, '')
                    formattedPhone = tenant.phone
                }
                if (tenant.trade_name) brandName = tenant.trade_name
            }
        } catch (error) {
            console.error('Error fetching tenant data:', error)
        }

        return { whatsappNumber, formattedPhone, brandName }
    },
    ['tenant_data'],
    { revalidate: 3600 }
)

export default async function ServicesPage() {
    const { whatsappNumber, brandName } = await getTenantData()
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Vim pelo site da ${brandName} e gostaria de saber mais sobre os serviços.`

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary/30 font-sans">

            {/* HEADER SIMPLIFICADO */}
            <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Voltar para Home
                    </Link>
                    <span className="font-bold text-lg text-white tracking-tight">
                        {brandName} <span className="text-primary">Tech</span>
                    </span>
                    <Link href={whatsappLink} target="_blank">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-slate-950 font-bold">
                            Falar no WhatsApp
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-24 pb-20 container mx-auto px-4 max-w-5xl">

                {/* HERO: O QUE ESPERAR */}
                <div className="text-center mb-20">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Entenda como <span className="text-primary">cuidamos do seu equipamento</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Não é apenas sobre "consertar". É sobre devolver a performance do seu computador e garantir que você não tenha dores de cabeça tão cedo.
                    </p>
                </div>

                {/* NOSSO PROCESSO (3 PASSOS) */}
                <section className="mb-24">
                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Linha conectora (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0" />

                        <div className="relative pt-8 text-center bg-slate-950 z-10">
                            <div className="w-16 h-16 mx-auto bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
                                <span className="text-2xl font-bold text-primary">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Avaliação Sincera</h3>
                            <p className="text-slate-400 text-sm leading-relaxed px-4">
                                Analisamos o problema real. Se não valer a pena consertar, nós avisamos. Sem "achismos" ou taxas surpresa.
                            </p>
                        </div>

                        <div className="relative pt-8 text-center bg-slate-950 z-10">
                            <div className="w-16 h-16 mx-auto bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
                                <span className="text-2xl font-bold text-primary">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Serviço Técnico</h3>
                            <p className="text-slate-400 text-sm leading-relaxed px-4">
                                Usamos peças de qualidade e ferramentas certas. Limpeza, organização dos cabos e cuidado em cada detalhe.
                            </p>
                        </div>

                        <div className="relative pt-8 text-center bg-slate-950 z-10">
                            <div className="w-16 h-16 mx-auto bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
                                <span className="text-2xl font-bold text-primary">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Testes Finais</h3>
                            <p className="text-slate-400 text-sm leading-relaxed px-4">
                                Antes de te entregar, testamos tudo. Áudio, vídeo, internet e velocidade. Você recebe pronto para usar.
                            </p>
                        </div>
                    </div>
                </section>

                {/* DETALHAMENTO DOS SERVIÇOS (PROBLEMA X SOLUÇÃO) */}
                <div className="space-y-24">

                    {/* NOTEBOOKS */}
                    <section id="notebooks" className="scroll-mt-28 grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="inline-flex gap-2 items-center text-primary font-bold mb-4 bg-primary/10 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                                <Laptop className="w-4 h-4" /> Notebooks e Laptops
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-6">Seu notebook está lento ou esquentando?</h2>
                            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                É comum que com o tempo o notebook fique lento ou faça barulho. Isso geralmente é sujeira interna ou falta de otimização.
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                                <h4 className="font-bold text-slate-200 mb-4">O que resolvemos aqui:</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-slate-300 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span><strong>Lentidão extrema:</strong> Otimização do sistema e upgrade para SSD (deixa até 10x mais rápido).</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-300 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span><strong>Aquecimento/Barulho:</strong> Limpeza interna completa e troca da pasta térmica.</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-300 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span><strong>Tela ou Teclado quebrados:</strong> Substituição por peças novas e compatíveis.</span>
                                    </li>
                                </ul>
                            </div>
                            <Link href={whatsappLink} target="_blank">
                                <Button className="bg-primary hover:bg-primary/90 text-slate-950 font-bold px-8 rounded-full">
                                    Pedir Orçamento para Notebook
                                </Button>
                            </Link>
                        </div>
                        <div className="order-1 md:order-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-white/5 aspect-square flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                            <Laptop className="w-32 h-32 text-slate-700 group-hover:text-primary/50 transition-colors duration-500" />
                        </div>
                    </section>

                    {/* COMPUTADORES */}
                    <section id="computadores" className="scroll-mt-28 grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-1">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-white/5 aspect-square flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                                <Monitor className="w-32 h-32 text-slate-700 group-hover:text-blue-500/50 transition-colors duration-500" />
                            </div>
                        </div>
                        <div className="order-2">
                            <div className="inline-flex gap-2 items-center text-blue-400 font-bold mb-4 bg-blue-400/10 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                                <Monitor className="w-4 h-4" /> Computadores e PCs
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-6">Computador para trabalho ou jogos</h2>
                            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                Montamos máquinas novas ou melhoramos a que você já tem. Foco em deixar o sistema rápido e os cabos organizados.
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                                <h4 className="font-bold text-slate-200 mb-4">Serviços comuns:</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-slate-300 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span><strong>Upgrade Gamer/Workstation:</strong> Instalação de Placa de Vídeo, mais Memória e Fontes Potentes.</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-300 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span><strong>Formatação Profissional:</strong> Backup dos seus arquivos e instalação limpa do Windows.</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-300 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span><strong>Montagem do Zero:</strong> Você compra as peças, nós montamos com cable management impecável.</span>
                                    </li>
                                </ul>
                            </div>
                            <Link href={whatsappLink} target="_blank">
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 rounded-full border-0">
                                    Melhorar meu Computador
                                </Button>
                            </Link>
                        </div>
                    </section>

                    {/* IMPRESSORAS */}
                    <section id="impressoras" className="scroll-mt-28 grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="inline-flex gap-2 items-center text-pink-400 font-bold mb-4 bg-pink-400/10 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                                <Printer className="w-4 h-4" /> Impressoras
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-6">Impressão falhando ou manchada?</h2>
                            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                Resolvemos problemas de atolamento de papel, falhas na cor e cabeçotes entupidos (Epson, Canon, HP, etc).
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                                <h4 className="font-bold text-slate-200 mb-4">Principais correções:</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-slate-300 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                                        <span><strong>Desentupimento:</strong> Limpeza técnica dos cabeçotes de impressão.</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-300 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                                        <span><strong>Manutenção de Bulk Ink:</strong> Ajuste de pressão e retirada de ar das mangueiras.</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-300 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                                        <span><strong>Almofadas de Tinta:</strong> Troca e reset do contador quando a impressora trava.</span>
                                    </li>
                                </ul>
                            </div>
                            <Link href={whatsappLink} target="_blank">
                                <Button className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 rounded-full border-0">
                                    Consertar Impressora
                                </Button>
                            </Link>
                        </div>
                        <div className="order-1 md:order-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-white/5 aspect-square flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-pink-500/5 group-hover:bg-pink-500/10 transition-colors" />
                            <Printer className="w-32 h-32 text-slate-700 group-hover:text-pink-500/50 transition-colors duration-500" />
                        </div>
                    </section>
                </div>

                {/* FAQ */}
                <section className="mt-32 pt-20 border-t border-white/5">
                    <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">Dúvidas Frequentes</h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                            <h3 className="font-bold text-white mb-2">Quanto tempo demora?</h3>
                            <p className="text-slate-400 text-sm">A maioria dos serviços (formatação, limpeza) fica pronto em até 24h. Diagnósticos de hardware podem levar um pouco mais para testes precisos.</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                            <h3 className="font-bold text-white mb-2">Vocês buscam o equipamento?</h3>
                            <p className="text-slate-400 text-sm">Sim, temos serviço de logística. Podemos retirar no seu local e devolver pronto. Consulte a taxa para sua região.</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                            <h3 className="font-bold text-white mb-2">Tem garantia?</h3>
                            <p className="text-slate-400 text-sm">Com certeza. Todos os serviços de peças e mão de obra possuem garantia (geralmente 90 dias) para sua segurança.</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                            <h3 className="font-bold text-white mb-2">Valem a pena consertar meu PC antigo?</h3>
                            <p className="text-slate-400 text-sm">Geralmente sim! Um SSD novo faz um computador de 5-7 anos parecer novo. Faremos uma análise honesta se compensa ou não.</p>
                        </div>
                    </div>
                </section>

                {/* FOOTER CTA */}
                <section className="text-center py-20 mt-12">
                    <h3 className="text-2xl font-bold text-white mb-6">Pronto para resolver?</h3>
                    <Link href={whatsappLink} target="_blank">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-slate-950 px-10 py-6 text-lg font-bold rounded-full shadow-xl shadow-primary/20">
                            Falar com Especialista no WhatsApp
                        </Button>
                    </Link>
                </section>

            </main>
        </div>
    )
}
