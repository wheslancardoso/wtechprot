'use client'

import { useState } from 'react'
import { Server, Shield, Zap, Building2, FileCheck, Clock, Users, CheckCircle2, ArrowRight, Laptop } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'



export function BusinessLanding() {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        empresa: '',
        necessidade: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState('')

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            const { error: insertError } = await supabase
                .from('leads')
                .insert([
                    {
                        name: formData.nome,
                        email: formData.email,
                        company: formData.empresa,
                        message: formData.necessidade,
                        source: 'ads_home_b2b'
                    }
                ])

            if (insertError) throw insertError

            setIsSubmitted(true)
        } catch (err) {
            console.error('Erro ao salvar lead:', err)
            setError('Ocorreu um erro ao enviar. Por favor, tente novamente ou entre em contato pelo telefone.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const scrollToForm = () => {
        document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="bg-slate-950 min-h-screen text-slate-50 flex flex-col">

            {/* NAV BAR */}
            <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                        <div className="w-8 h-8 relative flex items-center justify-center">
                            {/* Fallback icon se não tiver logo */}
                            <Building2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <span>WFIX Tech <span className="text-slate-500 text-sm font-normal">Solutions</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={scrollToForm} className="hidden md:flex text-slate-400 hover:text-white hover:bg-white/5">
                            Falar com Consultor
                        </Button>
                        <Button size="sm" asChild className="bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20">
                            <Link href="/manutencao">
                                <Laptop className="w-4 h-4 mr-2" />
                                Para Você (Pessoa Física)
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-16">
                {/* HERO SECTION */}
                <section className="relative py-24 lg:py-32 overflow-hidden">
                    {/* Background - Azul Navy/Cinza Sóbrio */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

                    <div className="container relative mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm font-medium mb-8">
                                <Shield className="w-4 h-4 text-blue-400" />
                                Gestão de Ativos e Infraestrutura de TI
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-slate-100 leading-tight">
                                Soluções Avançadas para Gestão de Hardware e Sustentação Tecnológica
                            </h1>

                            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Diagnóstico laboratorial, restauração de performance e consultoria em ciclo de vida de equipamentos.
                                Atuamos na resolução de incidentes críticos para infraestruturas corporativas e home office.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    size="lg"
                                    asChild
                                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg shadow-green-900/20 transition-all hover:shadow-xl w-full sm:w-auto"
                                    id="cta-whatsapp"
                                >
                                    <Link href="/manutencao">
                                        <Zap className="mr-2 w-5 h-5" />
                                        Agendar Diagnóstico Técnico
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={scrollToForm}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 text-lg rounded-lg w-full sm:w-auto"
                                >
                                    Falar com um Especialista
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SERVIÇOS - Transformação Semântica */}
                <section className="py-20 bg-slate-900/30 border-y border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                                Catálogo de Soluções Técnicas
                            </h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                Metodologia proprietária WFIX Tech para maximizar a disponibilidade dos seus ativos digitais.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-900/50 transition-all duration-300 hover:-translate-y-1">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-lg bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
                                        <Server className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <CardTitle className="text-slate-100 text-lg">Otimização de Sistemas e Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-slate-400 text-sm leading-relaxed">
                                        Restauramos a eficiência operacional de estações de trabalho através de reinstalação limpa de imagem corporativa, remoção de bloatware e calibração de drivers.
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-900/50 transition-all duration-300 hover:-translate-y-1">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-lg bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
                                        <Zap className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <CardTitle className="text-slate-100 text-lg">Upgrade e Substituição de Hardware</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-slate-400 text-sm leading-relaxed">
                                        Substituição de componentes críticos (Armazenamento, Memória, Fontes) para estender a vida útil do equipamento e evitar CAPEX desnecessário com máquinas novas.
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-900/50 transition-all duration-300 hover:-translate-y-1">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-lg bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
                                        <Shield className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <CardTitle className="text-slate-100 text-lg">Manutenção Preventiva e Higienização</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-slate-400 text-sm leading-relaxed">
                                        Limpeza química de componentes internos, troca de pasta térmica de alta condutividade e checklist de integridade para prevenção de falhas térmicas.
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* DIFERENCIAIS */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                                    Por Que Escolher a WFIX Tech
                                </h2>
                                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                    Segurança jurídica, técnica e fiscal para sua demanda.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/50 text-center hover:bg-slate-800/40 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-slate-100 font-semibold mb-2">SLA Ágil</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">Diagnóstico rápido para minimizar downtime.</p>
                                </div>
                                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/50 text-center hover:bg-slate-800/40 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                        <FileCheck className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-slate-100 font-semibold mb-2">Nota Fiscal</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">Total transparência e compliance fiscal.</p>
                                </div>
                                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/50 text-center hover:bg-slate-800/40 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-slate-100 font-semibold mb-2">Laboratório Próprio</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">Ambiente controlado anti-estático (ESD).</p>
                                </div>
                                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/50 text-center hover:bg-slate-800/40 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-slate-100 font-semibold mb-2">Peças Originais</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">Procedência garantida e garantia balcão.</p>
                                </div>
                            </div>

                            {/* Texto Corporativo */}
                            <div className="mt-16 p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
                                <p className="text-slate-300 text-center leading-relaxed max-w-3xl mx-auto">
                                    A <strong className="text-slate-100">WFIX Tech Solutions</strong> oferece consultoria técnica especializada em hardware.
                                    Atendemos demandas de <strong className="text-slate-100">manutenção corretiva e evolutiva</strong> para
                                    Pequenas Empresas e profissionais em regime de <strong className="text-slate-100">Home Office</strong>.
                                    Todo serviço acompanha laudo técnico e garantia legal.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FORMULÁRIO DE CONTATO */}
                <section id="contato" className="py-20 bg-slate-900/30 border-t border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="max-w-lg mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                                    Solicite uma Análise
                                </h2>
                                <p className="text-slate-400">
                                    Preencha o formulário e nossa equipe comercial entrará em contato.
                                </p>
                            </div>

                            {isSubmitted ? (
                                <Card className="bg-slate-900/50 border-green-800/50">
                                    <CardContent className="pt-10 pb-10 text-center">
                                        <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-100 mb-2">
                                            Solicitação Recebida
                                        </h3>
                                        <p className="text-slate-400">
                                            Nossa equipe analisará sua solicitação e retornará em até 24 horas úteis.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardContent className="pt-8">
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="nome" className="text-slate-300 text-sm">Nome Completo</Label>
                                                <Input
                                                    id="nome"
                                                    placeholder="Seu nome"
                                                    required
                                                    value={formData.nome}
                                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                                    className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-slate-500 focus:ring-slate-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-slate-300 text-sm">Email Corporativo</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="seu.email@empresa.com.br"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-slate-500 focus:ring-slate-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="empresa" className="text-slate-300 text-sm">Empresa</Label>
                                                <Input
                                                    id="empresa"
                                                    placeholder="Nome da sua empresa"
                                                    required
                                                    value={formData.empresa}
                                                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                                    className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-slate-500 focus:ring-slate-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="necessidade" className="text-slate-300 text-sm">Necessidade</Label>
                                                <Textarea
                                                    id="necessidade"
                                                    placeholder="Descreva brevemente sua necessidade de infraestrutura..."
                                                    rows={4}
                                                    value={formData.necessidade}
                                                    onChange={(e) => setFormData({ ...formData, necessidade: e.target.value })}
                                                    className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-slate-500 focus:ring-slate-500 resize-none"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 font-semibold"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Enviando...' : 'Solicitar Análise de Infraestrutura'}
                                            </Button>

                                            <p className="text-xs text-slate-600 text-center pt-2">
                                                Ao enviar, você concorda com nossa política de privacidade.
                                            </p>
                                        </form>
                                        {error && (
                                            <p className="text-sm text-red-500 text-center mt-4">
                                                {error}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-white/5 bg-slate-950 text-slate-500 text-center text-sm">
                <div className="container mx-auto px-4">
                    <p>© {new Date().getFullYear()} WFIX Tech Solutions. CNPJ: 64.928.869/0001-83</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <Link href="/politica-privacidade" className="hover:text-white">Política de Privacidade</Link>
                        <Link href="/termos-uso" className="hover:text-white">Termos de Uso</Link>
                        <Link href="/manutencao" className="hover:text-white">Manutenção Residencial</Link>
                    </div>
                </div>
            </footer>
        </div >
    )
}
