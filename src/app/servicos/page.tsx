import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Monitor, Laptop, Wifi, Headset, CheckCircle2, ArrowRight, Printer, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimateIn } from '@/components/ui/animate-in'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { InstagramSection } from '@/components/instagram-section'
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

export async function generateMetadata() {
    return {
        title: 'Manutenção e Performance de Hardware | WFIX Tech',
        description: 'Especialista em hardware. Manutenção de notebooks, PCs e impressoras com garantia.',
        robots: {
            index: false,
            follow: false,
            googleBot: {
                index: false,
                follow: false,
            },
        },
    }
}

export default async function ServicesPage() {
    const { whatsappNumber, brandName } = await getTenantData()
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Vim pelo site da ${brandName} e gostaria de saber mais sobre os serviços.`

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-x-hidden">

            {/* HEADER SIMPLIFICADO */}
            <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Voltar para Home</span><span className="sm:hidden">Voltar</span>
                    </Link>
                    <span className="font-bold text-lg text-primary tracking-tight">
                        {brandName}
                    </span>

                </div>
            </header>

            <main className="pt-24 pb-20 container mx-auto px-4 max-w-5xl">

                {/* HERO: O QUE ESPERAR */}
                <div className="text-center mb-16 relative">
                    {/* Blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[50px] animate-pulse pointer-events-none" />

                    <AnimateIn>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
                            Manutenção e Performance de <span className="text-primary">Hardware</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed relative z-10">
                            Não é apenas sobre "consertar". É sobre devolver a performance do seu computador e garantir que você não tenha dores de cabeça tão cedo.
                        </p>
                    </AnimateIn>
                </div>

                {/* NOSSO PROCESSO (3 PASSOS) */}
                <section className="mb-20">
                    <AnimateIn delay={0.2}>
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
                                    Alocamos componentes de alto padrão com precisão técnica. Manutenção preventiva, gerenciamento estrutural de cabos e proteção do seu patrimônio em cada detalhe.
                                </p>
                            </div>

                            <div className="relative pt-8 text-center bg-slate-950 z-10">
                                <div className="w-16 h-16 mx-auto bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
                                    <span className="text-2xl font-bold text-primary">3</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Testes Finais</h3>
                                <p className="text-slate-400 text-sm leading-relaxed px-4">
                                    Antes de te entregar, validamos tudo no laboratório. Áudio, vídeo, refrigeração e estabilidade. Você recebe pronto para uso intenso.
                                </p>
                            </div>
                        </div>
                    </AnimateIn>
                </section>

                {/* DETALHAMENTO DOS SERVIÇOS (PROBLEMA X SOLUÇÃO) */}
                <div className="space-y-16 md:space-y-24">

                    {/* NOTEBOOKS */}
                    <AnimateIn direction="left">
                        <section id="notebooks" className="scroll-mt-28 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div className="order-2 md:order-1 relative z-10">
                                <div className="inline-flex gap-2 items-center text-primary font-bold mb-4 bg-primary/10 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                                    <Laptop className="w-4 h-4" /> Notebooks e Laptops
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Seu notebook está lento ou esquentando?</h2>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                    É comum que com o tempo o notebook fique lento ou faça barulho. Isso geralmente é sujeira interna ou falta de otimização.
                                </p>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
                                    <h4 className="font-bold text-slate-200 mb-4">O que resolvemos aqui:</h4>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                            <span><strong>Reparo de Carcaça e Dobradiça:</strong> Restauração completa da estrutura física.</span>
                                        </li>
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                            <span><strong>Manutenção Preventiva Térmica:</strong> Higienização interna e aplicação de composto térmico de elite.</span>
                                        </li>
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                            <span><strong>Substituição de Peças:</strong> Teclados, Baterias e Telas originais.</span>
                                        </li>
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                            <span><strong>Upgrades de Performance:</strong> Substituição de HD por SSD e adição de Memória RAM.</span>
                                        </li>
                                    </ul>
                                </div>
                                <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 text-slate-950 font-bold px-8 rounded-full h-12 cursor-pointer relative z-20 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                                    <Link href={whatsappLink} target="_blank">
                                        Pedir Orçamento para Notebook
                                    </Link>
                                </Button>
                            </div>
                            <div className="order-1 md:order-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/5 aspect-square flex items-center justify-center relative overflow-hidden group shadow-2xl">
                                <Image
                                    src="/services/notebook-mt.png"
                                    alt="Reparo profissional de notebook em laboratório"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                            </div>
                        </section>
                    </AnimateIn>
                    {/* COMPUTADORES */}
                    <AnimateIn direction="right">
                        <section id="computadores" className="scroll-mt-28 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div className="order-1">
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/5 aspect-square flex items-center justify-center relative overflow-hidden group shadow-2xl">
                                    <Image
                                        src="/services/pc-mt.png"
                                        alt="Computador Gamer de Alta Performance com refrigeração líquida"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                                </div>
                            </div>
                            <div className="order-2 relative z-10">
                                <div className="inline-flex gap-2 items-center text-blue-400 font-bold mb-4 bg-blue-400/10 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                                    <Monitor className="w-4 h-4" /> Computadores e PCs
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Computador para trabalho ou jogos</h2>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                    Montamos máquinas novas ou melhoramos a que você já tem. Foco em deixar o sistema rápido e os cabos organizados.
                                </p>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
                                    <h4 className="font-bold text-slate-200 mb-4">Serviços comuns:</h4>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                            <span><strong>Montagem PC Gamer/Workstation:</strong> Consultoria e montagem.</span>
                                        </li>
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                            <span><strong>Diagnóstico Avançado:</strong> Identificação de hardware defeituoso.</span>
                                        </li>
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                            <span><strong>Upgrades Gerais:</strong> Instalação de SSD NVMe, RAM e GPU.</span>
                                        </li>
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                            <span><strong>Manutenção Preventiva Completa:</strong> Desoxidação e organização estrutural (cable management).</span>
                                        </li>
                                    </ul>
                                </div>
                                <Button asChild className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 rounded-full border-0 h-12 cursor-pointer relative z-20 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300">
                                    <Link href={whatsappLink} target="_blank">
                                        Melhorar meu Computador
                                    </Link>
                                </Button>
                            </div>
                        </section>
                    </AnimateIn>

                    {/* IMPRESSORAS */}
                    <AnimateIn direction="left">
                        <section id="impressoras" className="scroll-mt-28 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div className="order-2 md:order-1 relative z-10">
                                <div className="inline-flex gap-2 items-center text-pink-400 font-bold mb-4 bg-pink-400/10 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                                    <Printer className="w-4 h-4" /> Impressoras
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Impressão falhando ou manchada?</h2>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                    Resolvemos problemas de atolamento de papel, falhas na cor e cabeçotes entupidos (Epson, Canon, HP, etc).
                                </p>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
                                    <h4 className="font-bold text-slate-200 mb-4">Principais correções:</h4>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                                            <span><strong>Cabeça de Impressão:</strong> Desobstrução profissional.</span>
                                        </li>
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                                            <span><strong>Tracionador de Papel:</strong> Reparo do sistema de puxar folhas.</span>
                                        </li>
                                        <li className="flex gap-3 text-slate-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                                            <span><strong>Configuração de Rede Interna:</strong> Instalação local de impressoras Wi-Fi na sua rede.</span>
                                        </li>
                                    </ul>
                                </div>
                                <Button asChild className="w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 rounded-full border-0 h-12 cursor-pointer relative z-20 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-300">
                                    <Link href={whatsappLink} target="_blank">
                                        Consertar Impressora
                                    </Link>
                                </Button>
                            </div>
                            <div className="order-1 md:order-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/5 aspect-square flex items-center justify-center relative overflow-hidden group shadow-2xl">
                                <Image
                                    src="/services/printer-mt.png"
                                    alt="Manutenção de impressoras EcoTank e Laser"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                            </div>
                        </section>
                    </AnimateIn>

                    {/* INSTAGRAM / BASTIDORES */}
                    <div className="mt-24">
                        <InstagramSection />
                    </div>

                    {/* FAQ */}
                    <section className="mt-32 pt-20 border-t border-white/5">
                        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">Dúvidas sobre o Processo Técnico</h2>
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <SpotlightCard className="p-6 rounded-2xl bg-slate-900/50 border-white/5">
                                <h3 className="font-bold text-white mb-2">Quanto tempo demora?</h3>
                                <p className="text-slate-400 text-sm">A maioria das baterias de testes em nosso laboratório (otimização térmica, manutenção física) tem SLA concluído entre 24h a 48h. E não se preocupe: oferecemos <strong>90 dias de garantia</strong> estrutural e técnica sobre a peça consertada.</p>
                            </SpotlightCard>
                            <SpotlightCard className="p-6 rounded-2xl bg-slate-900/50 border-white/5">
                                <h3 className="font-bold text-white mb-2">Vocês buscam o equipamento?</h3>
                                <p className="text-slate-400 text-sm">Sim, temos serviço de logística. Podemos retirar no seu local e devolver pronto. Consulte a taxa para sua região.</p>
                            </SpotlightCard>
                            <SpotlightCard className="p-6 rounded-2xl bg-slate-900/50 border-white/5">
                                <h3 className="font-bold text-white mb-2">Valem a pena consertar meu PC antigo?</h3>
                                <p className="text-slate-400 text-sm">Geralmente sim! Um SSD novo faz um computador de 5-7 anos parecer novo. Faremos uma análise honesta se compensa ou não.</p>
                            </SpotlightCard>
                        </div>
                    </section>

                    {/* FOOTER CTA */}
                    <section className="text-center py-20 mt-12">
                        <h3 className="text-2xl font-bold text-white mb-6">Pronto para resolver?</h3>
                        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-slate-950 px-6 md:px-10 py-6 text-base md:text-lg font-bold rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 w-full md:w-auto cursor-pointer">
                            <Link href={whatsappLink} target="_blank">
                                Falar com Especialista no WhatsApp
                            </Link>
                        </Button>
                    </section>

                    {/* VOLTAR PARA HOME / OUTRAS SOLUÇÕES */}
                    <section className="text-center py-12 border-t border-white/5 mt-12 bg-slate-950/50 rounded-3xl">
                        <h3 className="text-xl font-bold text-slate-300 mb-6">Procurando outro tipo de serviço?</h3>
                        <Link href="/">
                            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full px-10 h-11 border border-slate-700 hover:border-slate-600 transition-all hover:scale-105 shadow-lg shadow-black/20 cursor-pointer relative z-20">
                                Conhecer todas as Soluções
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-2 w-4 h-4" aria-hidden="true">
                                    <path d="M5 12h14"></path>
                                    <path d="m12 5 7 7-7 7"></path>
                                </svg>
                            </button>
                        </Link>
                    </section>
                </div>
            </main>
        </div>
    )
}
