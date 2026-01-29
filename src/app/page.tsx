import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, FileSearch, Smartphone, MessageCircle, Wrench, CreditCard, Laptop, Home as HomeIcon, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import OrderTrackerInput from '@/components/landing/order-tracker-input'
import { createAdminClient } from '@/lib/supabase/server'

export default async function Home() {
  // Buscar dados dinamicamente
  let whatsappNumber = '5561999999999' // Fallback
  let formattedPhone = '(61) 99999-9999'
  let brandName = 'LAN.TECH' // Fallback Brand

  try {
    const supabase = await createAdminClient()
    const { data: tenant } = await supabase
      .from('tenants')
      .select('phone, trade_name')
      .limit(1)
      .single()

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

  const whatsappLink = `https://wa.me/${whatsappNumber}`

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50 selection:bg-primary selection:text-primary-foreground">

      {/* HEADER / NAV */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20">
              <Laptop className="w-5 h-5 text-primary" />
            </div>
            <span>{brandName}</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</Link>
            <Link href="#diferenciais" className="hover:text-white transition-colors">Diferenciais</Link>
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 hover:text-white transition-all">
              Login Técnico
              <ArrowRight className="w-4 h-4" />
            </Link>
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
              Seu PC, Notebook ou <br />
              Impressora travou?
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Esqueça a assistência técnica genérica. Tenha um especialista focado em <b>Desktops, Notebooks e Impressoras</b> cuidando do seu equipamento.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <OrderTrackerInput />

              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-500">
                <Link
                  href={whatsappLink}
                  target="_blank"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Agendar Visita / Retirada
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ESPECIALIDADES */}
        <section className="py-12 border-y border-white/5 bg-white/[0.02]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/5">
              <div className="p-4">
                <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-4">
                  <Laptop className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-2">Computadores & PC Gamer</h3>
                <p className="text-sm text-slate-400">Diagnóstico avançado (sem vídeo, BIOS), formatação, limpeza e montagem de setups.</p>
              </div>
              <div className="p-4">
                <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 mb-4">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-2">Notebooks</h3>
                <p className="text-sm text-slate-400">Troca de tela, teclado, bateria e upgrades de performance (SSD e Memória).</p>
              </div>
              <div className="p-4">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4">
                  <FileSearch className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-200 mb-2">Impressoras</h3>
                <p className="text-sm text-slate-400">Manutenção preventiva, limpeza interna, desentupimento e reset.</p>
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
                  title: 'Segurança Total',
                  desc: 'Seus dados são sagrados. Utilizo protocolos de segurança e mantenho total sigilo sobre seus arquivos e senhas.'
                }
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 hover:bg-white/[0.05] transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">
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
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center mb-6 shadow-xl group-hover:border-primary/50 transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-slate-950 font-bold text-xs flex items-center justify-center border-2 border-slate-950">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Seu computador precisa de ajuda?</h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Atendimento ágil, preço justo e transparência total.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-primary/20" asChild>
                <Link href={whatsappLink} target="_blank">
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
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                  <Laptop className="w-3 h-3 text-primary" />
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
              <h4 className="font-bold text-white mb-4">Links</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-primary">Área Restrita (Serviço)</Link></li>
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
          </div>

          <div className="border-t border-white/5 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
