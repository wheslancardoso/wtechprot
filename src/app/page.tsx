import Link from 'next/link'
import { ArrowLeft, Monitor, Laptop, Wifi, Headset, CheckCircle2, ArrowRight, Printer, Star, Quote, Building2, Cpu, Globe, FileText, Server, ShieldCheck, Instagram, Clock, Briefcase, Smartphone, UserCheck, MessageCircle, Wrench, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimateIn } from '@/components/ui/animate-in'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { InstagramSection } from '@/components/instagram-section'
import Image from 'next/image'
import Script from 'next/script'
import { createAdminClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import type { Metadata } from 'next'


// Forçar execução em runtime (não build time) para ter acesso às env vars do Railway
export const dynamic = 'force-dynamic'

// Cache de dados do tenant por 1 hora para evitar stale data no Edge Cache
import { getTenantData } from '@/lib/get-tenant-data'

export async function generateMetadata() {
  const { brandName } = await getTenantData()
  return {
    title: 'WFIX Tech | Solucoes em Tecnologia',
    description: 'Diagnóstico avançado, setups de alta performance e consultoria em tecnologia para profissionais e empresas.',
  }
}

export default async function Home() {
  const { whatsappNumber, formattedPhone, brandName } = await getTenantData()

  const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}`

  return (
    <div className="dark flex min-h-screen flex-col bg-slate-950 text-slate-50">

      {/* Google Tag Manager */}
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

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-5FG7HKVH"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      {/* HEADER / NAV */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-primary">WFIX <span className="text-white">Tech</span></span>
          </div>

          <a href="https://instagram.com/wfixtech" target="_blank" className="md:hidden text-slate-400 hover:text-primary transition-colors" aria-label="Siga-nos no Instagram">
            <Instagram className="w-6 h-6" />
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#solucoes" className="hover:text-white transition-colors">Soluções</Link>
            <Link href="#diferenciais" className="hover:text-white transition-colors">Diferenciais Corporativos</Link>
            <a href="https://instagram.com/wfixtech" target="_blank" className="hover:text-primary transition-colors" aria-label="Siga-nos no Instagram">
              <Instagram className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16 bg-noise">

        {/* HERO SECTION */}
        <section className="relative py-16 md:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950" />

          {/* Floating Blobs (Mobile Enchantment) */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] animate-pulse delay-700" />

          <div className="container relative mx-auto px-4 text-center">
            <AnimateIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6 md:mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Especialista em Tecnologia e Hardware
              </div>
            </AnimateIn>

            <AnimateIn delay={0.2}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">
                Manutenção de Alta Performance <br />
                para Notebooks e PCs
              </h1>
            </AnimateIn>

            <AnimateIn delay={0.3}>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed px-4">
                Da manutenção do seu notebook pessoal à gestão de TI da sua empresa. Tecnologia que funciona para você.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.4}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all transform hover:scale-105" asChild>
                  <Link href={whatsappLink} target="_blank" id="cta-whatsapp-hero">
                    <Building2 className="mr-2 h-5 w-5" />
                    Consultar Especialista
                  </Link>
                </Button>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-center max-w-lg mx-auto px-6">
                {[
                  { label: "Relatórios Técnicos", icon: FileText },
                  { label: "Laboratório Próprio", icon: Server },
                  { label: "Garantia de 90 Dias", icon: ShieldCheck },
                ].map((feat, i) => (
                  <div key={i} className="flex md:flex-col flex-row items-center justify-center md:justify-center gap-3 md:gap-2 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md shadow-lg">
                    <feat.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-slate-300">{feat.label}</span>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </section>



        {/* TRACKING SPOTLIGHT SECTION */}
        <section className="py-24 bg-gradient-to-b from-slate-950 to-primary/5 border-b border-white/5 relative overflow-hidden">
          {/* Decorative blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="container relative mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Text Content */}
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-2">
                  <Clock className="w-3 h-3" />
                  Gestão Digital de Ativos
                </div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                  Status de Serviços <br />
                  em Tempo Real.
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Nosso sistema de acompanhamento permite que você visualize cada etapa do reparo. Transparência total para sua segurança.
                </p>

                <ul className="space-y-3 text-slate-300 max-w-sm mx-auto lg:mx-0 text-left">
                  {[
                    "Portal do Cliente",
                    "Fotos dos Componentes Substituídos",
                    "Aprovação de Orçamento Online",
                    "Histórico Completo do Aparelho"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual UI Mockup */}
              <div className="flex-1 w-full max-w-md lg:max-w-full perspective-1000">
                <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50 overflow-hidden transform lg:rotate-y-12 lg:rotate-x-6 lg:hover:rotate-0 transition-all duration-700 ease-out group">
                  {/* Floating status badges */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20 animate-bounce">
                      Finalizado
                    </div>
                  </div>

                  {/* Header Mock */}
                  <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                      <div className="h-3 w-20 bg-white/5 rounded" />
                    </div>
                  </div>

                  {/* Timeline Mock - Animated */}
                  <div className="space-y-6 relative pl-4 border-l border-white/10 ml-2">
                    {[
                      { title: "Serviço Iniciado", time: "10:30", delay: "0s" },
                      { title: "Análise Técnica", time: "10:45", delay: "0.5s" },
                      { title: "Upgrades Implementados", time: "14:20", delay: "1s" },
                      { title: "Pronto para Entrega", time: "16:00", delay: "1.5s" }
                    ].map((step, i, arr) => (
                      <div
                        key={i}
                        className="relative pl-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                        style={{ animationDelay: step.delay }}
                      >
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-slate-900 ${i === arr.length - 1 ? 'animate-pulse' : ''}`} />
                        <p className="text-sm font-bold text-white mb-1">{step.title}</p>
                        <p className="text-xs text-slate-500">{step.time}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action - Animated */}
                  <div className="mt-8 pt-6 border-t border-white/5 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{ animationDelay: '2s' }}>
                    <div className="w-full py-3 bg-white/5 rounded-lg border border-dashed border-white/20 flex items-center justify-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
                      <FileText className="w-4 h-4" /> Laudo Técnico Incluso
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AGENDAMENTO DIGITAL SPOTLIGHT SECTION */}
        <section className="py-24 bg-gradient-to-t from-primary/5 to-slate-950 border-b border-white/5 relative overflow-hidden">
          {/* Decorative blob */}
          <div className="absolute top-1/2 right-0 md:right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container relative mx-auto px-4">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              {/* Text Content */}
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 mb-2">
                  <Calendar className="w-3 h-3" />
                  Conveniência e Rapidez
                </div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                  Agendamento Digital <br />
                  Exclusivo.
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Planeje sua visita ou atendimento no conforto de casa. Você recebe um link exclusivo, escolhe o dia e horário, e nossa equipe é notificada na mesma hora para aguardar você.
                </p>

                <ul className="space-y-3 text-slate-300 max-w-sm mx-auto lg:mx-0 text-left">
                  {[
                    "Sem Filas ou Tempo de Espera",
                    "Acesso à Agenda em Tempo Real",
                    "Horários Personalizados",
                    "Confirmação Imediata"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual UI Mockup */}
              <div className="flex-1 w-full max-w-md lg:max-w-full perspective-1000">
                <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-emerald-900/20 overflow-hidden transform lg:-rotate-y-12 lg:rotate-x-6 lg:hover:rotate-0 transition-all duration-700 ease-out group">

                  {/* Floating status badges */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 shadow-lg">
                      Link Válido
                    </div>
                  </div>

                  {/* Header Mock */}
                  <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="h-4 w-40 bg-white/10 rounded mb-2" />
                      <div className="h-3 w-24 bg-white/5 rounded" />
                    </div>
                  </div>

                  {/* Calendar Mock - Animated */}
                  <div className="space-y-4 relative">
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map(d => (
                        <div key={d} className={`h-10 rounded-lg flex items-center justify-center text-xs font-medium border transition-colors ${d === 3 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-slate-500 border-transparent'}`}>
                          {d + 10}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {[
                        { time: "09:00", status: "Indisponível", color: "bg-slate-800 text-slate-600 border-transparent", delay: "0s" },
                        { time: "10:30", status: "Selecionar Horário", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden", delay: "0.5s", active: true },
                        { time: "14:00", status: "Disponível", color: "bg-white/5 text-slate-400 border border-white/5", delay: "1s" },
                      ].map((slot, i) => (
                        <div
                          key={i}
                          className={`w-full py-3 px-4 rounded-xl flex items-center justify-between opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards] border ${slot.color}`}
                          style={{ animationDelay: slot.delay }}
                        >
                          {slot.active && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />
                          )}
                          <div className="flex items-center gap-2 relative z-10">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold">{slot.time}</span>
                          </div>
                          <span className="text-xs uppercase tracking-wider font-semibold relative z-10">{slot.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action - Animated */}
                  <div className="mt-8 pt-6 border-t border-white/5 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{ animationDelay: '1.5s' }}>
                    <div className="w-full py-3 bg-emerald-500/5 text-emerald-400 font-bold text-xs uppercase tracking-wider border border-dashed border-emerald-500/30 rounded-lg flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Notificação Enviada ao Técnico
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUCOES */}
        <section id="solucoes" className="py-12 border-y border-white/5 bg-white/[0.02]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">

              {/* 1. Hardware */}
              <SpotlightCard className="h-full p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-300 bg-slate-900/50 border-white/5">
                <div className="mx-auto w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-4 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">
                  <Monitor className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-3 group-hover:text-white transition-colors">Gestão e Manutenção de Hardware</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">Diagnóstico preciso, substituição de componentes defeituosos e upgrades de performance. Deixamos sua máquina nova de novo.</p>
              </SpotlightCard>

              {/* 2. Desempenho (Notebooks) */}
              <SpotlightCard className="h-full p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-300 bg-slate-900/50 border-white/5" spotlightColor="rgba(168, 85, 247, 0.2)">
                <div className="mx-auto w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 mb-4 shadow-[inset_0_0_20px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
                  <Laptop className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-3 group-hover:text-white transition-colors">Performance para Notebooks</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">Análise e implementação de melhorias em notebooks, incluindo substituição de display, bateria e otimização de sistema.</p>
              </SpotlightCard>

              {/* 3. Impressão (PRIORITIZED) */}
              <SpotlightCard className="h-full p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-300 bg-slate-900/50 border-white/5" spotlightColor="rgba(236, 72, 153, 0.2)">
                <div className="mx-auto w-14 h-14 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-400 mb-4 shadow-[inset_0_0_20px_rgba(236,72,153,0.2)] group-hover:scale-110 transition-transform">
                  <Printer className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-3 group-hover:text-white transition-colors">Gestão de Impressão</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">Especialista nos principais fabricantes do mercado (Ink Tank / Laser). Desobstrução de cabeçotes, troca de tracionador e manutenção de sistemas Bulk Ink.</p>
              </SpotlightCard>

              {/* 4. Remoto */}
              <SpotlightCard className="h-full p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-300 bg-slate-900/50 border-white/5" spotlightColor="rgba(34, 211, 238, 0.2)">
                <div className="mx-auto w-14 h-14 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 mb-4 shadow-[inset_0_0_20px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-3 group-hover:text-white transition-colors">Consultoria Remota</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">Consultoria técnica e suporte remoto seguro para ambientes de trabalho, com agilidade e total segurança.</p>
              </SpotlightCard>

              {/* 5. PC Gamer / Workstations */}
              <SpotlightCard className="h-full p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-300 bg-slate-900/50 border-white/5" spotlightColor="rgba(249, 115, 22, 0.2)">
                <div className="mx-auto w-14 h-14 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400 mb-4 shadow-[inset_0_0_20px_rgba(249,115,22,0.2)] group-hover:scale-110 transition-transform">
                  <Cpu className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-3 group-hover:text-white transition-colors">Montagem de Computadores</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">Do planejamento à montagem e organização (cable management) impecável.</p>
              </SpotlightCard>

              {/* 6. Redes (DEMOTED) */}
              <SpotlightCard className="h-full p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-300 bg-slate-900/50 border-white/5" spotlightColor="rgba(16, 185, 129, 0.2)">
                <div className="mx-auto w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                  <Wifi className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-3 group-hover:text-white transition-colors">Redes & Conectividade</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">Soluções pontuais para Wi-Fi e cabeamento em residências e pequenos escritórios.</p>
              </SpotlightCard>

            </div>

            <div className="mt-12 text-center">
              <Link href="/servicos">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full px-12 h-14 text-lg border-0 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                  Conhecer todas as Soluções <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* EXPERIÊNCIA DO CLIENTE (Client-Facing Features) */}
        <section className="py-24 bg-slate-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container relative mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-4">
                <FileText className="w-3 h-3" /> Monitoramento e Manutenção
              </div>
              <h2 className="text-3xl font-bold mb-4">Monitoramento e Manutenção de Equipamentos</h2>
              <p className="text-slate-400">Receba fotos, relatórios de evolução e o status da sua implementação direto no seu WhatsApp.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Feature 1: Check-in com Fotos */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Check-in com Fotos</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Registro fotográfico detalhado do estado do equipamento na entrada e saída. Segurança total sobre o estado do seu ativo.
                </p>
              </div>

              {/* Feature 2: Aprovação Digital */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Aprovação Digital</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Receba a análise técnica no seu celular. Aprove ou recuse itens com um clique, sem burocracia.
                </p>
              </div>

              {/* Feature 3: Assinatura Digital */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Assinatura Digital</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Confirmação de retirada segura via assinatura na tela do celular. Garantia de que o equipamento foi entregue a você.
                </p>
              </div>

              {/* Feature 4: PDF Oficial */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Relatório em PDF</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Download instantâneo do registro completo com fotos, especificações e termo de garantia. Perfeito para gestão de ativos.
                </p>
              </div>
            </div>

            {/* Bottom CTA */}

          </div>
        </section>

        {/* GALERIA PC GAMER (Husky Inspired) */}
        <section className="py-24 bg-slate-900 overflow-hidden relative border-t border-white/5" >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-slate-900 to-slate-900" />
          <div className="container relative mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4 text-white">Montagem de Setups de Alta Performance</h2>
              <p className="text-slate-400">Qualidade de montagem, cable management impecável e hardware configurado para máximo desempenho.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { id: 1, image: "/setup-rgb-01.jpg" },
                { id: 2, image: "/pc-gamer-1.jpg" },
                { id: 3, image: "/workspace-tech-03.jpg" },
              ].map((setup) => (
                <div key={setup.id} className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-500 shadow-lg hover:shadow-primary/20 bg-slate-950">
                  <div className="absolute inset-0 bg-slate-900">
                    <Image
                      src={setup.image}
                      alt="Setup Personalizado WFIX"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    {/* Gradient Overlay para integrar com o fundo dark */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* DEPOIMENTOS "HIBRIDOS" (Corporativo + Pessoal) */}
        <section className="py-24 bg-gradient-to-t from-slate-950 to-slate-900 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold text-center mb-16">O que dizem quem já confiou</h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Card 1 - Pessoal/Autônomo (Humanizado) */}
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl relative flex flex-col justify-between h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary text-4xl font-serif">"</div>
                <p className="text-slate-300 italic mb-6 leading-relaxed">
                  "Meu notebook estava esquentando muito e desligando sozinho no meio das reuniões. Fizeram uma limpeza completa e trocaram a pasta térmica. Agora funciona perfeitamente, silencioso e não esquenta nada. Serviço impecável!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500">R</div>
                  <div>
                    <div className="font-bold text-white">Ricardo M.</div>
                    <div className="text-xs text-primary">Arquiteto e Designer</div>
                  </div>
                </div>
              </div>

              {/* Card 2 - Empresarial (Profissional) */}
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl relative flex flex-col justify-between h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-4xl font-serif">"</div>
                <p className="text-slate-300 italic mb-6 leading-relaxed">
                  "Precisava reinstalar o sistema do meu PC mas tinha medo de perder meus arquivos de trabalho. Foi feito o backup de tudo com total segurança e otimização. Profissionalismo raro de encontrar."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500">A</div>
                  <div>
                    <div className="font-bold text-white">Ana Paula S.</div>
                    <div className="text-xs text-blue-400">Consultora Financeira</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* DIFERENCIAIS */}
        <section id="diferenciais" className="py-24 bg-slate-950" >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Compromisso com a Excelência</h2>
              <p className="text-slate-400">Aliamos rigor técnico a um atendimento focado na continuidade do seu negócio e na segurança dos seus ativos.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Building2,
                  title: 'Agilidade e Continuidade',
                  desc: 'Atendimento on-site especializado ou logística segura de coleta e entrega, garantindo o mínimo impacto em sua produtividade.'
                },
                {
                  icon: UserCheck,
                  title: 'Diagnóstico Transparente',
                  desc: 'Comunicação clara e objetiva. Você recebe um detalhamento completo da solução, com total previsibilidade de custos e prazos.'
                },
                {
                  icon: ShieldCheck,
                  title: 'Sigilo e Privacidade',
                  desc: 'Garantimos a integridade total dos seus dados através de protocolos rigorosos de segurança e discrição em todas as etapas do serviço.'
                }
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/50 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA (STEPS) */}
        <section id="como-funciona" className="py-24 relative overflow-hidden" >
          <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left scale-110" />

          <div className="container relative mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Fluxo de Atendimento</h2>
              <p className="text-slate-400">Processo estruturado para não impactar sua operação.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Linha conectora (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />

              {[
                { icon: MessageCircle, title: '1. Agendamento', desc: 'Solicite atendimento via WhatsApp ou Portal. Triagem inicial rápida da sua necessidade.' },
                { icon: Wrench, title: '2. Diagnóstico', desc: 'Análise do equipamento e envio de orçamento detalhado para aprovação.' },
                { icon: CheckCircle2, title: '3. Manutenção', desc: 'Execução do serviço com peças de qualidade e laboratório especializado.' },
                { icon: Server, title: '4. Entrega', desc: 'Equipamento testado, higienizado e pronto para uso com garantia.' },
              ].map((step, i) => (
                <div key={i} className="relative z-10 text-center group">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center mb-6 shadow-xl group-hover:border-primary/50 group-hover:scale-110 group-hover:shadow-primary/20 transition-all duration-300">
                    <step.icon className="w-7 h-7 text-primary group-hover:animate-bounce" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-slate-950 font-bold text-xs flex items-center justify-center border-2 border-slate-950 group-hover:scale-125 transition-transform">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ - PERGUNTAS FREQUENTES */}
        <section className="py-24 bg-slate-900 border-t border-white/5" >
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Dúvidas Frequentes</h2>
              <p className="text-slate-400">O que você precisa saber antes de iniciar o atendimento no nosso laboratório.</p>
            </div>

            <div className="space-y-4">
              <details className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden open:bg-white/[0.04] transition-colors duration-300">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-200 font-bold hover:text-white transition-colors">
                  <h3 className="text-lg">Vocês fazem atendimento domiciliar ou presencial nas empresas?</h3>
                  <div className="white-space-nowrap text-primary group-open:-rotate-180 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-2 text-slate-400 leading-relaxed border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-300">
                  <p>
                    Sim! Vamos até sua residência ou empresa caso não possa trazer a máquina ao nosso laboratório. Para serviços complexos, fazemos do recolhimento do seu aparelho em segurança.
                  </p>
                </div>
              </details>

              <details className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden open:bg-white/[0.04] transition-colors duration-300">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-200 font-bold hover:text-white transition-colors">
                  <h3 className="text-lg">Posso comprar peças na internet para montagem do meu PC?</h3>
                  <div className="white-space-nowrap text-primary group-open:-rotate-180 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-2 text-slate-400 leading-relaxed border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-300">
                  <p>
                    Com certeza! Você compra as peças (Processador, Placa de Vídeo, etc.) e nós cobramos apenas o serviço físico no laboratório, realizando testes de refrigeração e instalação física do Windows limpo.
                  </p>
                </div>
              </details>

              <details className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden open:bg-white/[0.04] transition-colors duration-300">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-200 font-bold hover:text-white transition-colors">
                  <h3 className="text-lg">Como funciona a garantia das peças e mão de obra?</h3>
                  <div className="white-space-nowrap text-primary group-open:-rotate-180 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-2 text-slate-400 leading-relaxed border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-300">
                  <p>
                    Qualquer reparo na bancada conta com garantia mínima de <b>90 dias</b> contra defeitos do serviço prestado. Emitimos os termos de garantia diretamente para você.
                  </p>
                </div>
              </details>

              <details className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden open:bg-white/[0.04] transition-colors duration-300">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-200 font-bold hover:text-white transition-colors">
                  <h3 className="text-lg">Como solicitar um orçamento de conserto?</h3>
                  <div className="white-space-nowrap text-primary group-open:-rotate-180 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-2 text-slate-400 leading-relaxed border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-300">
                  <p>
                    Basta chamar pelo WhatsApp. Se for de fácil solução e direto, cotamos na hora. Para computadores difíceis ou mortos, é necessária a análise física no nosso laboratório antes de enviar os valores precisos.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* MAPA E CONTATO */}
        <section className="py-24 bg-slate-950 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Coluna 1: Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Laboratório e Atendimento Físico</h2>
                  <p className="text-slate-400">
                    Bancada pronta para receber seu computador, notebook ou impressora em Goiânia e Região.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">Localização</h3>
                      <p className="text-slate-400 text-sm italic">Goiânia - GO (Atendimento com hora marcada)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">Horário</h3>
                      <p className="text-slate-400 text-sm">Segunda a Sexta: 08:00 às 18:00</p>
                      <p className="text-slate-400 text-sm">Sábado: 08:00 às 12:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">Contato</h3>
                      <p className="text-slate-400 text-sm">{formattedPhone}</p>
                      <p className="text-slate-400 text-sm">wfixtech.contato@gmail.com</p>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="rounded-full shadow-lg shadow-primary/20" asChild>
                  <Link href={whatsappLink} target="_blank" id="cta-whatsapp-contato">
                    Consultar Especialista
                  </Link>
                </Button>
              </div>

              {/* Coluna 2: Mapa */}
              <div className="h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122295.45493208575!2d-49.4058981!3d-16.6204683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ef6b2f4f107f7%3A0xe54955b760a92f02!2sGoi%C3%A2nia%2C%20GO!5e0!3m2!1spt-BR!2sbr!4v1707238472911!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </section>



        {/* CALLOUT B2B */}
        {/*
        <section className="py-20 bg-slate-950 relative overflow-hidden border-t border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="container relative mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 mb-4 uppercase tracking-wider">
                <Briefcase className="w-3 h-3" /> Para Empresas
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Procurando soluções para seu negócio?</h2>
              <p className="text-slate-400 text-lg">
                Consultoria, Redes Wi-Fi e Gestão de TI completa. Estabilidade e segurança para garantir a continuidade da sua operação.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button size="lg" className="whitespace-nowrap rounded-full px-8 h-14 text-lg shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:scale-105 transition-all bg-indigo-600 hover:bg-indigo-500 text-white border-0" asChild>
                <Link href="/para-empresas">
                  Conhecer Soluções <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        */}


        <a
          id="cta-whatsapp-float"
          href={whatsappLink}
          target="_blank"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-110 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in delay-1000 group"
        >
          <MessageCircle className="w-8 h-8 text-white fill-white" />
          <span className="absolute right-full mr-4 bg-white text-slate-900 px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
            Fale Conosco
          </span>
        </a>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/5 py-12 text-sm text-slate-500" >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center font-bold text-base">
                <span className="text-primary">WFIX <span className="text-white">Tech</span></span>
              </div>
              <p>Soluções em Tecnologia e Gestão de TI para Empresas.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Soluções</h4>
              <ul className="space-y-2">
                <li><a href="#solucoes" className="hover:text-primary">Computadores de Alta Performance</a></li>
                <li><a href="#solucoes" className="hover:text-primary">Notebooks</a></li>
                <li><a href="#solucoes" className="hover:text-primary">Infraestrutura de Redes</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> {formattedPhone}
                </li>
                <li className="flex items-center gap-2">
                  <a href="https://instagram.com/wfixtech" target="_blank" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Instagram className="w-4 h-4" /> @wfixtech
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Institucional</h4>
              <ul className="space-y-2">
                <li><Link href="/politica-privacidade" className="hover:text-primary">Política de Privacidade</Link></li>
                <li><Link href="/termos-uso" className="hover:text-primary">Termos de Uso</Link></li>
                <li><Link href="/para-empresas" className="hover:text-primary font-bold text-blue-400">Soluções para Empresas</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <p>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</p>
              <p className="text-xs text-slate-600">CNPJ: 64.928.869/0001-83</p>
              <p className="text-xs text-slate-600">Goiânia - GO | Atendimento com hora marcada</p>
            </div>
          </div>
        </div>
      </footer>
    </div >
  )
}
