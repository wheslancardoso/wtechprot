import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, FileSearch, Smartphone, MessageCircle, Wrench, CreditCard, Laptop, Home as HomeIcon, UserCheck, Printer, Monitor, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Script from 'next/script'
// import OrderTrackerInput from '@/components/landing/order-tracker-input'
import { createAdminClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

// Forçar execução em runtime (não build time) para ter acesso às env vars do Railway
export const dynamic = 'force-dynamic'

// Cache de dados do tenant por 1 hora para evitar stale data no Edge Cache
const getTenantData = unstable_cache(
  async () => {
    let whatsappNumber = '5561999999999' // Fallback
    let formattedPhone = '(61) 99999-9999'
    let brandName = 'WFIX Tech' // Fallback Brand

    try {
      const supabase = await createAdminClient()

      // Buscar tenant padrão diretamente pelo ID
      const DEFAULT_TENANT_ID = '8132d666-06c0-46a7-b362-a30393be96c0'

      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('phone, trade_name')
        .eq('id', DEFAULT_TENANT_ID)
        .single()

      if (error) {
        console.error('Erro ao buscar tenant padrão:', error)
      }

      if (tenant) {
        if (tenant.phone) {
          const cleanPhone = tenant.phone.replace(/\D/g, '')
          whatsappNumber = `55${cleanPhone}`
          formattedPhone = tenant.phone
        }
        if (tenant.trade_name && tenant.trade_name !== 'Minha Assistência') {
          brandName = tenant.trade_name
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados da home:', error)
    }

    return { whatsappNumber, formattedPhone, brandName }
  },
  ['tenant-data'],
  { revalidate: 3600, tags: ['tenant'] }
)

export async function generateMetadata() {
  const { brandName } = await getTenantData()
  return {
    title: brandName,
  }
}

export default async function Home() {
  const { whatsappNumber, formattedPhone, brandName } = await getTenantData()

  const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}`

  return (
    <div className="dark flex min-h-screen flex-col bg-slate-950 text-slate-50 selection:bg-primary selection:text-primary-foreground">

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
            <div className="w-12 h-12 relative flex items-center justify-center">
              <Image src="/logo.svg" alt="Logo" width={48} height={48} className="object-contain" />
            </div>
            <span>{brandName}</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</Link>
            <Link href="#diferenciais" className="hover:text-white transition-colors">Diferenciais</Link>
            <Link href="/" className="hover:text-blue-400 transition-colors font-semibold border border-blue-500/30 rounded-full px-3 py-1 bg-blue-500/10">Para Empresas</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">

        {/* HERO SECTION */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950" />

          <div className="container relative mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Disponível para atendimentos
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Manutenção de <br />
              PC, Notebook e Impressora
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Atendimento técnico especializado em <b>Desktops, Notebooks e Impressoras</b>. Diagnóstico profissional e suporte personalizado para seu equipamento.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all transform hover:scale-105" asChild>
                  <Link href={whatsappLink} target="_blank" id="cta-whatsapp-hero">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Falar com Técnico no WhatsApp
                  </Link>
                </Button>

                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto border-white/10 hover:bg-white/5 hover:text-white transition-all backdrop-blur-sm" asChild>
                  <Link href="#como-funciona">
                    Ver como funciona
                  </Link>
                </Button>
              </div>

              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Orçamento com fotos", icon: Smartphone },
                  { label: "Aprovação online", icon: CheckCircle2 },
                  { label: "Garantia estendida", icon: ShieldCheck },
                  { label: "Pagamento facilitado", icon: CreditCard },
                ].map((feat, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm">
                    <feat.icon className="h-5 w-5 text-primary/80" />
                    <span className="text-xs font-medium text-slate-300">{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>
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
                  Acompanhamento Online
                </div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                  Acompanhe o status <br />
                  do seu equipamento online.
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Nosso sistema de <b>Rastreamento em Tempo Real</b> permite que você acompanhe cada etapa do conserto pelo seu celular. Fotos do diagnóstico, aprovação de orçamento e aviso de conclusão.
                </p>

                <ul className="space-y-3 text-slate-300 max-w-sm mx-auto lg:mx-0 text-left">
                  {[
                    "Acompanhe tudo por um Link Exclusivo",
                    "Veja fotos das peças trocadas",
                    "Aprove orçamentos com um clique",
                    "Histórico completo do serviço"
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
                      Pronto para retirada
                    </div>
                  </div>

                  {/* Header Mock */}
                  <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                      <div className="h-3 w-20 bg-white/5 rounded" />
                    </div>
                  </div>

                  {/* Timeline Mock */}
                  <div className="space-y-6 relative pl-4 border-l border-white/10 ml-2">
                    {[
                      { title: "Diagnóstico Concluído", time: "10:30", active: true },
                      { title: "Orçamento Aprovado", time: "10:45", active: true },
                      { title: "Peças Trocadas", time: "14:20", active: true },
                      { title: "Disponível para Retirada", time: "16:00", active: true }
                    ].map((step, i) => (
                      <div key={i} className={`relative pl-6 ${step.active ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-slate-900" />
                        <p className="text-sm font-bold text-white mb-1">{step.title}</p>
                        <p className="text-xs text-slate-500">{step.time}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="w-full h-10 bg-primary/20 rounded border border-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                      Ver Termo de Garantia (PDF)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* ESPECIALIDADES */}
        <section className="py-12 border-y border-white/5 bg-white/[0.02]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/5">
              <div className="p-4 animate-in fade-in zoom-in duration-700 delay-100 hover:scale-105 transition-transform cursor-default">
                <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-500/20">
                  <Monitor className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-2">Computadores & PC Gamer</h3>
                <p className="text-sm text-slate-400">Diagnóstico Avançado de Hardware (BIOS, Vídeo), Montagem de Setup com Cable Management e Otimização Térmica.</p>
              </div>
              <div className="p-4 animate-in fade-in zoom-in duration-700 delay-200 hover:scale-105 transition-transform cursor-default">
                <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-500/20">
                  <Laptop className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-2">Notebooks</h3>
                <p className="text-sm text-slate-400">Substituição Técnica de telas, teclados e baterias, Reparo de Carcaças/Dobradiças e Upgrade de performance (SSD/RAM).</p>
              </div>
              <div className="p-4 animate-in fade-in zoom-in duration-700 delay-300 hover:scale-105 transition-transform cursor-default">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
                  <Printer className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-2">Impressoras</h3>
                <p className="text-sm text-slate-400">Desobstrução do Sistema de Tinta (falhas de impressão), Reset de Almofadas/Erros Lógicos e Manutenção Preventiva de tracionadores.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DIFERENCIAIS */}
        <section id="diferenciais" className="py-24 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Por que confiar?</h2>
              <p className="text-slate-400">Meu objetivo é resolver seu problema com honestidade e tecnologia. Você sabe exatamente o que está sendo feito.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: HomeIcon,
                  title: 'Atendimento Domiciliar',
                  desc: 'Vou até sua casa ou escritório. Se for complexo, retiro o equipamento para análise em laboratório próprio e devolvo pronto.'
                },
                {
                  icon: UserCheck,
                  title: 'Especialista Dedicado',
                  desc: 'Sem intermediários. Você fala diretamente com quem está consertando seu computador. Atendimento humano e personalizado.'
                },
                {
                  icon: ShieldCheck,
                  title: 'Proteção de Dados',
                  desc: 'Seus dados são tratados com cuidado. Utilizo protocolos de segurança e privacidade para proteger seus arquivos e informações.'
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
        <section id="como-funciona" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left scale-110" />

          <div className="container relative mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Como é o processo?</h2>
              <p className="text-slate-400">Sem burocracia. Tudo digital e direto ao ponto.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Linha conectora (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />

              {[
                { icon: MessageCircle, title: '1. Contato', desc: 'Me chame no WhatsApp. Explique o problema e agendamos a visita ou retirada.' },
                { icon: Wrench, title: '2. Diagnóstico', desc: 'Avalio o equipamento e envio um orçamento detalhado com fotos direto no seu celular.' },
                { icon: CheckCircle2, title: '3. Reparo', desc: 'Você aprova com um clique. Acompanhe o progresso em tempo real pelo sistema.' },
                { icon: Smartphone, title: '4. Entrega', desc: 'Equipamento pronto. Levo até você e o pagamento é feito na entrega.' },
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

        {/* CTA FINAL */}
        <section className="py-24 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Entre em contato para um orçamento</h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Atendimento ágil, preço justo e transparência total.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-primary/20" asChild>
                <Link href={whatsappLink} target="_blank" id="cta-whatsapp-footer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar com o Técnico
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/5 py-12 text-sm text-slate-500">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-base text-white">
                <div className="w-6 h-6 relative flex items-center justify-center">
                  <Image src="/logo.svg" alt="Logo" width={24} height={24} className="object-contain" />
                </div>
                {brandName}
              </div>
              <p>Suporte técnico pessoal e especializado.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Serviços</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary">Montagem de PC Gamer</a></li>
                <li><a href="#" className="hover:text-primary">Manutenção de Notebooks</a></li>
                <li><a href="#" className="hover:text-primary">Configuração de Impressoras</a></li>
              </ul>
            </div>



            <div>
              <h4 className="font-bold text-white mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> {formattedPhone}
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Institucional</h4>
              <ul className="space-y-2">
                <li><Link href="/politica-privacidade" className="hover:text-primary">Política de Privacidade</Link></li>
                <li><Link href="/termos-uso" className="hover:text-primary">Termos de Uso</Link></li>
                <li><Link href="/" className="hover:text-primary font-bold">Acesso Corporativo</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <p>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</p>
              <p className="text-xs text-slate-600">CNPJ: 64.928.869/0001-83</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
