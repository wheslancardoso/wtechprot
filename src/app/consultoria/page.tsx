'use client'

import { useState } from 'react'
import { Server, Network, TrendingUp, Building2, ShieldCheck, Clock, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const services = [
    {
        icon: Server,
        title: 'Gestão de Ciclo de Vida de Hardware',
        description: 'Manutenção preventiva e otimização de estações de trabalho para máxima performance e longevidade dos equipamentos corporativos.'
    },
    {
        icon: Network,
        title: 'Infraestrutura de Redes',
        description: 'Configuração, segurança e monitoramento para conectividade estável e protegida do seu escritório ou ambiente corporativo.'
    },
    {
        icon: TrendingUp,
        title: 'Consultoria em Performance',
        description: 'Diagnóstico avançado e recomendações estratégicas para upgrades e otimização de equipamentos de TI.'
    }
]

const benefits = [
    {
        icon: Clock,
        title: 'Agilidade no Atendimento',
        description: 'SLA definido com resposta rápida para minimizar tempo de parada.'
    },
    {
        icon: FileText,
        title: 'Nota Fiscal e Contrato',
        description: 'Documentação completa para controle fiscal e contábil da sua empresa.'
    },
    {
        icon: ShieldCheck,
        title: 'Garantia Corporativa',
        description: 'Garantia estendida em todos os serviços com suporte pós-atendimento.'
    },
    {
        icon: Building2,
        title: 'Atendimento In-Loco',
        description: 'Opção de suporte presencial no seu escritório ou laboratório especializado.'
    }
]

export default function ConsultoriaPage() {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        empresa: '',
        mensagem: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simular envio (substituir por integração real)
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSubmitted(true)
    }

    const scrollToForm = () => {
        document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="bg-slate-950">
            {/* HERO SECTION */}
            <section className="relative py-24 lg:py-32 overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

                <div className="container relative mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                            <Building2 className="w-4 h-4" />
                            Soluções Corporativas em TI
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Soluções de Infraestrutura de TI e Gestão de Ativos para Sua Empresa
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Garanta a continuidade do seu negócio com suporte especializado,
                            redução de custos operacionais e gestão inteligente de recursos de tecnologia.
                        </p>

                        <Button
                            size="lg"
                            onClick={scrollToForm}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
                        >
                            Solicitar Proposta Comercial
                        </Button>
                    </div>
                </div>
            </section>

            {/* SERVIÇOS */}
            <section className="py-20 bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Nossos Serviços Corporativos
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Soluções completas para gestão de infraestrutura e ativos de TI da sua empresa.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {services.map((service, index) => (
                            <Card
                                key={index}
                                className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                            >
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                        <service.icon className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <CardTitle className="text-white text-xl">{service.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-slate-400 text-base leading-relaxed">
                                        {service.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* POR QUE NÓS */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Por Que Escolher a WTECH?
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Comprometimento com excelência e resultados mensuráveis para o seu negócio.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/30 text-center hover:bg-slate-800/50 transition-all"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                    <benefit.icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">{benefit.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FORMULÁRIO DE CONTATO */}
            <section id="contato" className="py-20 bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Solicite uma Proposta
                            </h2>
                            <p className="text-slate-400 text-lg">
                                Preencha o formulário e nossa equipe entrará em contato em até 24 horas úteis.
                            </p>
                        </div>

                        {isSubmitted ? (
                            <Card className="bg-slate-800/50 border-green-500/30">
                                <CardContent className="pt-8 pb-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Proposta Solicitada!
                                    </h3>
                                    <p className="text-slate-400">
                                        Recebemos sua solicitação. Nossa equipe comercial entrará em contato em breve.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-slate-800/50 border-slate-700/50">
                                <CardContent className="pt-8">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="nome" className="text-slate-300">Nome Completo</Label>
                                            <Input
                                                id="nome"
                                                placeholder="Seu nome"
                                                required
                                                value={formData.nome}
                                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-slate-300">Email Corporativo</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="contato@suaempresa.com.br"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="empresa" className="text-slate-300">Nome da Empresa</Label>
                                            <Input
                                                id="empresa"
                                                placeholder="Razão Social ou Nome Fantasia"
                                                required
                                                value={formData.empresa}
                                                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mensagem" className="text-slate-300">Mensagem (Opcional)</Label>
                                            <Textarea
                                                id="mensagem"
                                                placeholder="Descreva brevemente sua necessidade..."
                                                rows={4}
                                                value={formData.mensagem}
                                                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                                        </Button>

                                        <p className="text-xs text-slate-500 text-center">
                                            Ao enviar, você concorda com nossa política de privacidade.
                                        </p>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
