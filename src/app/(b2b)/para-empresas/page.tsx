import { LeadForm } from "@/components/leads/lead-form"
import { ShieldCheck, Zap, BarChart3, Clock, CheckCircle2, Server, Laptop, Wifi, Store, Bot, Settings, Smartphone, Wrench, ArrowRight, XCircle, TrendingUp } from "lucide-react"
import type { Metadata } from 'next'
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    title: 'WFIX Tech | Soluções Empresariais',
    description: 'Gestão de TI completa para pequenos negócios. Infraestrutura de rede, laboratório próprio e suporte técnico especializado.',
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
                                Dos computadores da sua recepção à infraestrutura de rede do seu escritório.
                                A <span className="text-white font-semibold">WFIX Tech</span> garante disponibilidade, performance e manutenção sem dor de cabeça para sua equipe.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105" asChild>
                                    <a href="#contato">Falar com Consultor</a>
                                </Button>
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white" asChild>
                                    <a href="#solucoes">Conhecer Soluções</a>
                                </Button>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-slate-500 animate-in fade-in duration-1000 delay-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Manutenção Ágil
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Infraestrutura
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" /> Laboratório Próprio
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

            {/* PROBLEMAS (DORES) - NEW SECTION */}
            <section id="vantagens" className="py-24 bg-slate-900 relative border-y border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">O que impede seu crescimento?</h2>
                        <p className="text-slate-400">Identificamos os gargalos mais comuns em pequenos negócios.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Problem 1 */}
                        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <XCircle className="w-24 h-24 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                                <XCircle className="w-5 h-5" /> Suporte Demorado
                            </h3>
                            <p className="text-slate-400 mb-6 text-sm">
                                O computador parou e sua equipe fica ociosa esperando dias pelo "rapaz da TI"?
                            </p>
                            <div className="pt-6 border-t border-slate-800">
                                <h4 className="text-green-400 font-bold text-sm mb-1 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> A Solução WFIX
                                </h4>
                                <p className="text-slate-300 text-sm">Atendimento Rápido e Presencial. Laboratório próprio para diagnósticos imediatos.</p>
                            </div>
                        </div>

                        {/* Problem 2 */}
                        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <XCircle className="w-24 h-24 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                                <XCircle className="w-5 h-5" /> Wi-Fi Instável
                            </h3>
                            <p className="text-slate-400 mb-6 text-sm">
                                Internet cai na hora de passar o cartão? Clientes reclamam que o sinal é fraco?
                            </p>
                            <div className="pt-6 border-t border-slate-800">
                                <h4 className="text-green-400 font-bold text-sm mb-1 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> A Solução WFIX
                                </h4>
                                <p className="text-slate-300 text-sm">Rede Mesh Corporativa. Sinal forte em todo o ambiente e rede separada para visitantes.</p>
                            </div>
                        </div>

                        {/* Problem 3 */}
                        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <XCircle className="w-24 h-24 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                                <XCircle className="w-5 h-5" /> Computador Lento
                            </h3>
                            <p className="text-slate-400 mb-6 text-sm">
                                O sistema trava com o cliente no balcão? Perde tempo reiniciando a máquina?
                            </p>
                            <div className="pt-6 border-t border-slate-800">
                                <h4 className="text-green-400 font-bold text-sm mb-1 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> A Solução WFIX
                                </h4>
                                <p className="text-slate-300 text-sm">Otimização Profissional. Deixamos seu PC rápido como novo sem precisar formatar.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES - EXPANDED */}
            <section id="solucoes" className="py-32 bg-slate-950 relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Explore nossas Soluções</h2>
                        <p className="text-xl text-slate-400">Ferramentas desenhadas para simplificar a sua rotina.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Service 1: Hardware & Devices */}
                        <SpotlightCard className="p-8 h-full bg-slate-900/40 border-slate-800 hover:border-indigo-500/50 transition-colors group" spotlightColor="rgba(99, 102, 241, 0.2)">
                            <div className="w-14 h-14 bg-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                                <Laptop className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Gestão de Equipamentos</h3>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Ideal para: Escritórios, Clínicas, Call Centers.
                            </p>
                            <div className="space-y-4">
                                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                    <h4 className="text-indigo-400 font-bold text-sm mb-1">Como funciona?</h4>
                                    <p className="text-sm text-slate-500">Padronizamos e gerenciamos o hardware dos seus colaboradores (PCs e Notebooks).</p>
                                </div>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> <span>Inventário e Ciclo de Vida</span></li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> <span>Manutenção Preventiva Agendada</span></li>
                                </ul>
                            </div>
                        </SpotlightCard>

                        {/* Service 2: Networks & Wi-Fi */}
                        <SpotlightCard className="p-8 h-full bg-slate-900/40 border-slate-800 hover:border-purple-500/50 transition-colors group" spotlightColor="rgba(168, 85, 247, 0.2)">
                            <div className="w-14 h-14 bg-purple-900/30 text-purple-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                                <Wifi className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Redes & Wi-Fi</h3>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Ideal para: Cafés, Restaurantes, Escritórios.
                            </p>
                            <div className="space-y-4">
                                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                    <h4 className="text-purple-400 font-bold text-sm mb-1">Como funciona?</h4>
                                    <p className="text-sm text-slate-500">Instalamos pontos de acesso profissionais que cobrem todo o ambiente.</p>
                                </div>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> <span>Cliente faz check-in para acessar</span></li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> <span>Você ganha o contato do cliente</span></li>
                                </ul>
                            </div>
                        </SpotlightCard>

                        {/* Service 3: Maintenance */}
                        <SpotlightCard className="p-8 h-full bg-slate-900/40 border-slate-800 hover:border-emerald-500/50 transition-colors group" spotlightColor="rgba(16, 185, 129, 0.15)">
                            <div className="w-14 h-14 bg-emerald-900/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                                <Wrench className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Gestão Contínua de TI</h3>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Ideal para: Empresas que precisam de operação ininterrupta.
                            </p>
                            <div className="space-y-4">
                                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                    <h4 className="text-emerald-400 font-bold text-sm mb-1">Como funciona?</h4>
                                    <p className="text-sm text-slate-500">Contratos de manutenção preventiva com laboratório próprio no backstage.</p>
                                </div>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Reparo ágil no nosso laboratório</span></li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Coberturas com SLA garantido</span></li>
                                </ul>
                            </div>
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
                                    Pare de perder tempo com tecnologia que não funciona. Deixe a WFIX Tech cuidar disso para você focar em vender.
                                </p>

                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-1">Crescimento Acelerado</h4>
                                            <p className="text-sm text-slate-400">Empresas com tecnologia certa crescem 2x mais rápido.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-1">Garantia WFIX</h4>
                                            <p className="text-sm text-slate-400">Atendimento humanizado e garantia técnica em todos os reparos.</p>
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
