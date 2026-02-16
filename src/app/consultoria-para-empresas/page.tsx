'use client'

import { useState } from 'react'
import { Server, Shield, Zap, Building2, FileCheck, Clock, Users, CheckCircle2, Monitor, Laptop, Wifi, Globe, Cpu, Printer, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import Image from 'next/image'

const brandName = 'WFIX Tech'
const whatsappLink = 'https://wa.me/5562982870196?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20an%C3%A1lise%20de%20infraestrutura%20para%20minha%20empresa.'

// Services List with SAFE COPY
const services = [
    {
        icon: Server,
        color: 'blue',
        title: 'Gestão de Ativos de TI',
        description: 'Administração completa do ciclo de vida dos equipamentos (Lifecycle Management). Inventário, manutenção preventiva e descarte ecológico.'
    },
    {
        icon: Laptop,
        color: 'purple',
        title: 'Manutenção de Frota',
        description: 'Contratos de manutenção para notebooks e desktops corporativos. Padronização de imagens (sysprep) e upgrades de hardware em massa.'
    },
    {
        icon: Shield,
        color: 'emerald',
        title: 'Segurança de Endpoint',
        description: 'implementação de políticas de segurança, antivírus gerenciado e backup em nuvem para estações de trabalho críticas.'
    },
    {
        icon: Wifi,
        color: 'cyan',
        title: 'Infraestrutura de Redes',
        description: 'Projetos de cabeamento estruturado e redes Wi-Fi Mesh corporativas. Diagnóstico de gargalos e latência.'
    },
    {
        icon: Database, // Changed from Zap to Database for B2B feel, though Zap is fine. Keeping imports consistent.
        // Actually lets reuse Zap but call it Performance
        color: 'orange',
        title: 'Performance Tuning',
        description: 'Otimização de workstations para softwares de engenharia (CAD/BIM) e criação de conteúdo. Análise de gargalos de hardware.'
    },
    {
        icon: Printer,
        color: 'pink',
        title: 'Gestão de Impressão',
        description: 'Consultoria para redução de custos de impressão. Manutenção de plotters e impressoras de grande formato.'
    }
]

import { createClient } from '@/lib/supabase/client'
import { Database } from 'lucide-react'

export default function ConsultoriaPage() {
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
                        source: 'ads_bridge_page_consultoria'
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
        <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-primary/20 selection:text-primary">

            {/* HEADER SIMPLIFICADO (Sem link para Home "agressiva") */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center font-bold text-white">
                            W
                        </div>
                        <span className="font-semibold text-white">{brandName} <span className="text-xs text-slate-400 font-normal border border-slate-700 px-1 rounded">B2B</span></span>
                    </div>
                    <Link href={whatsappLink} target="_blank">
                        <Button variant="outline" size="sm" className="hidden md:flex border-primary/20 hover:bg-primary/10 text-primary">
                            Falar com Consultor
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-16">
                {/* HERO SECTION - Visual igual Home, Texto Blindado */}
                <section className="relative py-24 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />

                    <div className="container relative mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Building2 className="w-3 h-3" />
                            Soluções Corporativas
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            Gestão Inteligente de <br />
                            Infraestrutura de TI
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                            Consultoria especializada em <b>otimização de ativos, redução de custos e segurança da informação</b> para pequenas e médias empresas.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <Button size="lg" onClick={scrollToForm} className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                                Solicitar Análise de Infraestrutura
                            </Button>
                        </div>
                    </div>
                </section>

                {/* TECH AUTHORITY STRIP */}
                <div className="border-y border-white/5 bg-white/[0.02] py-8">
                    <div className="container mx-auto px-4">
                        <p className="text-center text-sm font-medium text-slate-500 mb-6 uppercase tracking-wider">
                            Especialistas em Tecnologias Corporativas
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {['MS WINDOWS SERVER', 'LINUX', 'VMWARE', 'CISCO', 'AWS'].map((tech) => (
                                <span key={tech} className="text-xl md:text-2xl font-bold text-slate-300 font-mono tracking-tighter">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* VISUAL CARDS SECTION (Copy Blindada) */}
                <section className="py-24 border-b border-white/5 bg-white/[0.02]">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <div key={index} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/50 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1">
                                    <div className={`mx-auto w-14 h-14 bg-${service.color}-500/10 rounded-full flex items-center justify-center text-${service.color}-400 mb-4 shadow-lg shadow-${service.color}-500/20 group-hover:scale-110 transition-transform`}>
                                        <service.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-200 mb-3 group-hover:text-white transition-colors text-center">{service.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed text-center">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TRACKING SECTION (Adapted for B2B) */}
                <section className="py-24 bg-gradient-to-b from-slate-950 to-primary/5 border-b border-white/5 relative overflow-hidden">
                    <div className="container relative mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 space-y-6 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-2">
                                    <Clock className="w-3 h-3" />
                                    SLA Atendimento
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                    Gestão Transparente <br />
                                    de Demandas.
                                </h2>
                                <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                    Acompanhe chamados, inventário e manutenção preventiva através de processos auditáveis.
                                </p>
                                <ul className="space-y-3 text-slate-300 max-w-sm mx-auto lg:mx-0 text-left">
                                    {[
                                        "Relatórios de Conformidade",
                                        "Inventário de Hardware",
                                        "Histórico de Manutenção por Ativo",
                                        "Controle de Custos de TI"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Visual UI Mockup (Reuse code structure but simplified) */}
                            <div className="flex-1 w-full max-w-md lg:max-w-full perspective-1000">
                                <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50 overflow-hidden transform lg:rotate-y-12 lg:rotate-x-6 lg:hover:rotate-0 transition-all duration-700 ease-out group">
                                    <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Briefcase className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">Relatório Mensal</div>
                                            <div className="text-xs text-slate-400">Março 2026</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-2 bg-slate-800 rounded w-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[95%]"></div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Uptime Servidores</span>
                                            <span className="text-emerald-400 font-bold">99.8%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FORMULÁRIO */}
                <section id="contato" className="py-20 bg-slate-900/30">
                    <div className="container mx-auto px-4">
                        <div className="max-w-lg mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                                    Fale com um Consultor
                                </h2>
                                <p className="text-slate-400">
                                    Receba um diagnóstico preliminar da sua infraestrutura sem compromisso.
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
                                            Nossa equipe de consultoria analisará sua solicitação e retornará em breve.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardContent className="pt-8">
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="nome" className="text-slate-300 text-sm">Nome</Label>
                                                    <Input
                                                        id="nome"
                                                        required
                                                        value={formData.nome}
                                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                                        className="bg-slate-950 border-slate-700 text-slate-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-slate-300 text-sm">Email Corporativo</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="bg-slate-950 border-slate-700 text-slate-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="empresa" className="text-slate-300 text-sm">Empresa</Label>
                                                    <Input
                                                        id="empresa"
                                                        required
                                                        value={formData.empresa}
                                                        onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                                        className="bg-slate-950 border-slate-700 text-slate-100"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 font-semibold"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Enviando...' : 'Solicitar Contato'}
                                            </Button>
                                        </form>
                                        {error && (
                                            <p className="text-sm text-red-500 text-center mt-4">{error}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </section>

                {/* FOOTER SIMPLIFICADO */}
                <footer className="py-8 border-t border-white/5 bg-slate-950 text-center text-slate-600 text-sm">
                    <div className="container mx-auto px-4">
                        <p className="mb-2">&copy; {new Date().getFullYear()} {brandName} Solutions. Todos os direitos reservados.</p>
                        <p>Gestão de Infraestrutura de TI &bull; Consultoria Especializada</p>
                    </div>
                </footer>
            </main>
        </div>
    )
}
