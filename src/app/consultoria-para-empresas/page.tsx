'use client'

import { useState } from 'react'
import { Server, Shield, Zap, Building2, FileCheck, Clock, Users, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const services = [
    {
        icon: Server,
        title: 'Gestão do Ciclo de Vida de Ativos',
        description: 'Administramos todo o ciclo de vida dos equipamentos de TI da sua empresa, desde a aquisição até a desativação, garantindo máxima eficiência operacional.'
    },
    {
        icon: Zap,
        title: 'Otimização de Performance de Hardware',
        description: 'Diagnóstico avançado e implementação de melhorias para que seus equipamentos operem com desempenho máximo e maior vida útil.'
    },
    {
        icon: Shield,
        title: 'Consultoria em Conectividade e Redes',
        description: 'Análise, configuração e segurança da infraestrutura de rede corporativa para garantir conectividade estável e protegida.'
    }
]

const differentials = [
    {
        icon: Clock,
        title: 'Agilidade',
        description: 'SLA definido com tempo de resposta reduzido para minimizar impacto operacional.'
    },
    {
        icon: FileCheck,
        title: 'Nota Fiscal',
        description: 'Documentação fiscal completa para controle contábil e transparência.'
    },
    {
        icon: Building2,
        title: 'Atendimento In-Loco',
        description: 'Suporte presencial no seu escritório ou em nosso laboratório especializado.'
    },
    {
        icon: Users,
        title: 'Equipe Especializada',
        description: 'Profissionais certificados com foco em infraestrutura corporativa.'
    }
]

import { createClient } from '@/lib/supabase/client'

// ... imports remain the same

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
                        source: 'ads_bridge_page'
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
        <div className="bg-slate-950">
            {/* HERO SECTION */}
            <section className="relative py-24 lg:py-32 overflow-hidden">
                {/* Background - Azul Navy/Cinza Sóbrio */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent" />

                <div className="container relative mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm font-medium mb-8">
                            <Building2 className="w-4 h-4" />
                            Soluções para PMEs
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-slate-100 leading-tight">
                            Gestão Inteligente de Infraestrutura de TI para Pequenas e Médias Empresas
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Reduza custos e aumente a produtividade da sua equipe com nosso
                            suporte especializado em gestão de ativos e infraestrutura corporativa.
                        </p>

                        <Button
                            size="lg"
                            onClick={scrollToForm}
                            className="bg-slate-100 hover:bg-white text-slate-900 px-8 py-6 text-lg font-semibold rounded-lg shadow-lg transition-all hover:shadow-xl"
                        >
                            Solicitar Análise de Infraestrutura
                        </Button>
                    </div>
                </div>
            </section>

            {/* SERVIÇOS */}
            <section className="py-20 bg-slate-900/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                            Nossas Soluções Corporativas
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Serviços especializados para otimizar a infraestrutura de TI do seu negócio.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {services.map((service, index) => (
                            <Card
                                key={index}
                                className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300"
                            >
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                                        <service.icon className="w-7 h-7 text-slate-300" />
                                    </div>
                                    <CardTitle className="text-slate-100 text-lg">{service.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-slate-400 text-sm leading-relaxed">
                                        {service.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* SOBRE / DIFERENCIAIS */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                                Por Que Empresas Escolhem a WFIX Tech
                            </h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                Comprometimento com resultados e atendimento profissional para o segmento corporativo.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {differentials.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/50 text-center"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                        <item.icon className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <h3 className="text-slate-100 font-semibold mb-2">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Texto Corporativo */}
                        <div className="mt-16 p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
                            <p className="text-slate-300 text-center leading-relaxed max-w-3xl mx-auto">
                                A <strong className="text-slate-100">WFIX Tech Solutions</strong> atua com foco em
                                pequenas e médias empresas, oferecendo consultoria especializada em gestão de
                                infraestrutura de TI. Nosso modelo de atendimento contempla tanto o suporte
                                in-loco quanto laboratorial, sempre com emissão de <strong className="text-slate-100">nota fiscal</strong> e
                                relatórios detalhados para seu controle gerencial.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FORMULÁRIO DE CONTATO */}
            <section id="contato" className="py-20 bg-slate-900/30">
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
                                            className="w-full bg-slate-100 hover:bg-white text-slate-900 py-6 font-semibold"
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
        </div>
    )
}
