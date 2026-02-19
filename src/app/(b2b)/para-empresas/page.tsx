import { LeadForm } from "@/components/leads/lead-form"
import { ShieldCheck, Zap, BarChart3, Clock, CheckCircle2, Server, Laptop, Wifi, Store, Bot, Settings, Smartphone, Wrench, ArrowRight } from "lucide-react"
import type { Metadata } from 'next'
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: 'WFIX Tech | Soluções Empresariais',
    description: 'Gestão de TI completa para pequenos negócios. Sistemas, automação e suporte técnico especializado.',
}

export default function B2BPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">

            {/* HERO SECTION */}
            <section className="relative py-24 lg:py-36 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

                <div className="container relative mx-auto px-4 z-10">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 mb-8 uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <Store className="w-3 h-3" /> Especialista em Pequenos Negócios
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                                Tecnologia que <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">impulsiona resultados.</span>
                            </h1>

                            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                                Do sistema de agendamento da sua barbearia à rede Wi-Fi da sua loja.
                                A <span className="text-white font-semibold">WFIX Tech</span> traz as ferramentas das grandes empresas para o seu dia a dia.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105" asChild>
                                    <a href="#contato">Falar com Consultor</a>
                                </Button>
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white" asChild>
                                    <a href="#servicos">Conhecer Soluções</a>
                                </Button>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-slate-500 animate-in fade-in duration-1000 delay-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Suporte Ágil
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Automação
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" /> Gestão
                                </div>
                            </div>
                        </div>

                        {/* Correction: Split Container to allow overflow */}
                        <div className="flex-1 w-full relative max-w-lg lg:max-w-none animate-in fade-in zoom-in duration-1000 delay-300">
                            <div className="relative aspect-square md:aspect-video lg:aspect-square">

                                {/* Inner Container with Overflow Hidden (for content/ui) */}
                                <div className="absolute inset-0 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl group z-10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />

                                    {/* Abstract Dashboard UI */}
                                    <div className="absolute inset-10 bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col gap-4 shadow-inner">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-500">
                                                    <Bot className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="h-2 w-24 bg-slate-800 rounded mb-1" />
                                                    <div className="h-2 w-16 bg-slate-800 rounded opacity-50" />
                                                </div>
                                            </div>
                                            <div className="h-8 w-24 bg-indigo-600 rounded-md opacity-20" />
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 transition-colors group-hover:border-indigo-500/30">
                                                <div className="h-8 w-8 bg-green-500/20 rounded-full mb-3" />
                                                <div className="h-2 w-full bg-slate-800 rounded mb-2" />
                                                <div className="h-2 w-2/3 bg-slate-800 rounded opacity-50" />
                                            </div>
                                            <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 transition-colors group-hover:border-indigo-500/30">
                                                <div className="h-8 w-8 bg-cyan-500/20 rounded-full mb-3" />
                                                <div className="h-2 w-full bg-slate-800 rounded mb-2" />
                                                <div className="h-2 w-2/3 bg-slate-800 rounded opacity-50" />
                                            </div>
                                            <div className="col-span-2 bg-slate-900 rounded-lg border border-slate-800 p-4 transition-colors group-hover:border-indigo-500/30 flex items-center gap-4">
                                                <div className="h-10 w-10 bg-purple-500/20 rounded-full flex-shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-2 w-full bg-slate-800 rounded" />
                                                    <div className="h-2 w-1/2 bg-slate-800 rounded opacity-50" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badge (Outside Overflow Hidden) */}
                                <div className="absolute -bottom-6 -right-6 lg:bottom-10 lg:-right-10 bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-4 animate-bounce duration-[3000ms] z-20">
                                    <div className="bg-green-500/20 p-2 rounded-lg text-green-500">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Produtividade</p>
                                        <p className="text-lg font-bold text-white">+ 40%</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section id="servicos" className="py-32 bg-slate-950 relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Soluções Sob Medida</h2>
                        <p className="text-xl text-slate-400">Entendemos a realidade do microempreendedor. Soluções práticas, sem burocracia e com alto impacto.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Service 1: Systems & AI */}
                        <SpotlightCard className="p-8 h-full bg-slate-900/40 border-slate-800 hover:border-indigo-500/50 transition-colors group" spotlightColor="rgba(99, 102, 241, 0.2)">
                            <div className="w-14 h-14 bg-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                                <Smartphone className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Sistemas & Apps</h3>
                            <p className="text-slate-400 leading-relaxed mb-8">
                                Implantação de sistemas de gestão (ERP), controle de estoque e aplicativos de agendamento online para otimizar seu tempo.
                            </p>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> <span>Agendamento Online</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> <span>Gestão Financeira</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> <span>Controle de Estoque</span></li>
                            </ul>
                        </SpotlightCard>

                        {/* Service 2: Networks & Wi-Fi */}
                        <SpotlightCard className="p-8 h-full bg-slate-900/40 border-slate-800 hover:border-purple-500/50 transition-colors group" spotlightColor="rgba(168, 85, 247, 0.2)">
                            <div className="w-14 h-14 bg-purple-900/30 text-purple-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                                <Wifi className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Redes & Wi-Fi</h3>
                            <p className="text-slate-400 leading-relaxed mb-8">
                                Wi-Fi rápido e seguro. Separe a rede dos clientes da rede interna e evite lentidão ou riscos de segurança.
                            </p>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> <span>Wi-Fi Check-in (Social)</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> <span>Rede Administrativa</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> <span>Cimalhamento de Dados</span></li>
                            </ul>
                        </SpotlightCard>

                        {/* Service 3: Maintenance */}
                        <SpotlightCard className="p-8 h-full bg-slate-900/40 border-slate-800 hover:border-emerald-500/50 transition-colors group" spotlightColor="rgba(16, 185, 129, 0.15)">
                            <div className="w-14 h-14 bg-emerald-900/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                                <Wrench className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Suporte Técnico</h3>
                            <p className="text-slate-400 leading-relaxed mb-8">
                                Seu computador travou? Resolvemos rápido. Manutenção preventiva e otimização para garantir produtividade.
                            </p>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Otimização de Performance</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Remoção de Vírus</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Configuração de E-mail</span></li>
                            </ul>
                        </SpotlightCard>
                    </div>
                </div>
            </section>

            {/* CTA / FORM SECTION */}
            <section id="contato" className="py-24 bg-slate-900 relative border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <div className="grid lg:grid-cols-2">
                            <div className="p-12 lg:p-16 flex flex-col justify-center relative">
                                {/* Decorative blobs */}
                                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
                                    Modernize seu negócio hoje.
                                </h2>
                                <p className="text-lg text-slate-400 mb-10 relative z-10">
                                    Seja uma barbearia, lojinha ou escritório. Temos a solução certa para você faturar mais e ter menos dor de cabeça com TI.
                                </p>

                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                            <Bot className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-1">IA & Automação</h4>
                                            <p className="text-sm text-slate-400">Atenda seus clientes 24h por dia com agendamento online e chatbots.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-1">Segurança de Dados</h4>
                                            <p className="text-sm text-slate-400">Backups automáticos e proteção contra invasões para sua tranquilidade.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 p-12 lg:p-16 border-l border-white/5 backdrop-blur-sm">
                                <LeadForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}
