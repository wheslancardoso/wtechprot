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
                        {brandName} <span className="text-primary">Performance</span>
                    </span>
                    <Link href={whatsappLink} target="_blank">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-slate-950 font-bold">
                            Falar no WhatsApp
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-24 pb-20 container mx-auto px-4 max-w-5xl">

                {/* INTRO */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Soluções Técnicas de <span className="text-primary">Alta Performance</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Engenharia de hardware e otimização de infraestrutura.
                        Foco total na continuidade do seu trabalho e durabilidade dos ativos.
                    </p>
                </div>

                {/* WORKSTATIONS SECTION */}
                <section id="workstations" className="mb-24 scroll-mt-28">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
                                <Monitor className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Computadores de Alta Performance</h2>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    Engenharia de hardware e otimização de infraestrutura. Resolvemos lentidão, travamentos e tela azul para garantir sua produtividade.
                                </p>
                                <ul className="grid md:grid-cols-2 gap-3 mb-8">
                                    {[
                                        'Otimização de Sistema Operacional',
                                        'Upgrade de SSD e Memória RAM',
                                        'Manutenção Preventiva e Otimização Térmica',
                                        'Montagem de Workstations (Cable Management)',
                                        'Atualização de BIOS e Drivers',
                                        'Sanitização de Sistema e Otimização'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={whatsappLink} target="_blank">
                                    <Button className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10">
                                        Solicitar Análise de Performance <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NOTEBOOKS SECTION */}
                <section id="notebooks" className="mb-24 scroll-mt-28">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
                                <Laptop className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Soluções para Estações Móveis</h2>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    Soluções de Continuidade Operacional para equipamentos portáteis. Resolvemos <b>falhas de inicialização, lentidão, aquecimento ou danos físicos.</b>
                                </p>
                                <ul className="grid md:grid-cols-2 gap-3 mb-8">
                                    {[
                                        'Substituição de Painel de Imagem',
                                        'Restauração de Carcaça e Dobradiças',
                                        'Substituição de Teclado e Bateria',
                                        'Manutenção Preventiva e Otimização Térmica',
                                        'Expansão de memória RAM e SSD',
                                        'Otimização de Sistema Operacional'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={whatsappLink} target="_blank">
                                    <Button className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10">
                                        Consultar Especialista <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRINTERS SECTION (NEW FOCUS) */}
                <section id="impressoras" className="mb-24 scroll-mt-28">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
                                <Printer className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Gestão de Impressão</h2>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    Suporte multimarcas para equipamentos de alta performance. Identificamos e corrigimos falhas para retomar sua operação.
                                </p>
                                <ul className="grid md:grid-cols-2 gap-3 mb-8">
                                    {[
                                        'Desobstrução de cabeça de impressão',
                                        'Troca de Reservatório de Resíduos',
                                        'Substituição de Mecanismo de Tração',
                                        'Pressurização do sistema de tinta',
                                        'Instalação de equipamento na rede',
                                        'Resolução de erros de digitalização',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={whatsappLink} target="_blank">
                                    <Button className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10">
                                        Solicitar Análise de Performance <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* REMOTE SUPPORT SECTION */}
                <section id="remoto" className="mb-24 scroll-mt-28">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
                                <Headset className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Consultoria Remota</h2>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    Recuperação de performance via acesso seguro. Ideal para resolver <b>erros de software imediatamente</b> sem visita presencial.
                                </p>
                                <ul className="grid md:grid-cols-2 gap-3 mb-8">
                                    {[
                                        'Sanitização de Sistema e Segurança',
                                        'Mapeamento e Configuração de Software',
                                        'Resolução de conflitos de drivers',
                                        'Configuração de periféricos',
                                        'Otimização de sistema lento',
                                        'Atendimento imediato (sem agendamento)'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={whatsappLink} target="_blank">
                                    <Button className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10">
                                        Solicitar Acesso Seguro <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* REDES SECTION (MOVED TO BOTTOM) */}
                <section id="redes" className="mb-24 scroll-mt-28">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
                                <Wifi className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Redes & Conectividade</h2>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    Diagnóstico de conectividade para eliminar <b>gargalos de rede e instabilidade</b> em chamadas de vídeo e sistemas.
                                </p>
                                <ul className="grid md:grid-cols-2 gap-3 mb-8">
                                    {[
                                        'Configuração de Repetidores/Mesh',
                                        'Cabeamento de rede estruturado',
                                        'Configuração de Roteadores',
                                        'Diagnóstico de conexão',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={whatsappLink} target="_blank">
                                    <Button className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10">
                                        Melhorar Conexão <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER CTA */}
                <section className="text-center py-12 border-t border-white/5">
                    <h3 className="text-2xl font-bold text-white mb-4">Precisa de algo mais específico?</h3>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                        Nossa equipe de engenharia está pronta para analisar casos complexos e projetos personalizados.
                    </p>
                    <Link href={whatsappLink} target="_blank">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-slate-950 px-8 font-bold rounded-full">
                            Falar com Consultor de Tecnologia
                        </Button>
                    </Link>
                </section>

            </main>
        </div>
    )
}
