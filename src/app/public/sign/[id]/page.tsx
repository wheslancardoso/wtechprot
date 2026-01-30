'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { signCustodyTerm } from '@/app/os/[id]/actions'
import { Loader2, MapPin, CheckCircle2, ShieldAlert, Package, ArrowRight, FileSignature, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PublicSignPage() {
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [order, setOrder] = useState<any>(null)
    const [geolocation, setGeolocation] = useState<{ lat: number; lng: number } | null>(null)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [success, setSuccess] = useState(false)

    // Fetch Order Data
    useEffect(() => {
        async function fetchOrder() {
            if (!id) return

            // Support both UUID and DisplayID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

            let query = supabase
                .from('orders')
                .select(`
                    id, display_id, status, 
                    accessories_received, custody_conditions,
                    equipment:equipments(type, brand, model, serial_number),
                    customer:customers(name, document_id)
                `)

            if (isUuid) {
                query = query.eq('id', id)
            } else {
                query = query.eq('display_id', id)
            }

            const { data, error } = await query.single()

            if (error) {
                console.error('Erro ao buscar pedido:', error)
                toast({ title: 'Erro', description: 'Pedido não encontrado.', variant: 'destructive' })
                setLoading(false)
                return
            }

            if (data.status !== 'open' && data.status !== 'analyzing') {
                // If already signed, maybe show success state?
            }

            setOrder(data)
            setLoading(false)
        }

        fetchOrder()
    }, [id, supabase, toast])


    const handleCaptureLocation = () => {
        setSubmitting(true)
        if (!navigator.geolocation) {
            toast({ title: 'Erro', description: 'Geolocalização não suportada.', variant: 'destructive' })
            setSubmitting(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGeolocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
                setSubmitting(false)
                toast({ title: 'Localização Capturada!', description: 'Coordenadas registradas com sucesso.' })
            },
            (error) => {
                console.error(error)
                setSubmitting(false)
                toast({ title: 'Erro de Localização', description: 'Permita o acesso ao GPS para continuar.', variant: 'destructive' })
            },
            { enableHighAccuracy: true }
        )
    }

    const handleSign = async () => {
        if (!geolocation) {
            toast({ title: 'Localização Obrigatória', description: 'Clique em "Capturar Localização" antes de confirmar.', variant: 'destructive' })
            return
        }
        if (!acceptedTerms) {
            toast({ title: 'Aceite Obrigatório', description: 'Você precisa aceitar os termos para continuar.', variant: 'destructive' })
            return
        }

        try {
            setSubmitting(true)

            // Chamada da Server Action (Reutilizando a existente)
            // Note: signCustodyTerm espera OrderId (UUID). Se tivermos display_id no URL, precisamos usar o UUID do state
            const result = await signCustodyTerm(order.id, {
                accessories: order.accessories_received || [],
                conditions: order.custody_conditions || '',
                signatureUrl: null,
                geolocation: geolocation
            })

            if (!result.success) throw new Error(result.message)

            setSuccess(true) // Show success view instead of redirecting

        } catch (error) {
            console.error(error)
            toast({
                title: 'Erro ao assinar',
                description: error instanceof Error ? error.message : 'Falha desconhecida.',
                variant: 'destructive'
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-500">
                <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h1 className="text-2xl font-bold text-center mb-2">Tudo Certo!</h1>
                <p className="text-muted-foreground text-center max-w-sm mb-8">
                    O termo foi assinado e o equipamento já está registrado em nosso sistema.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Link href="/" className="w-full">
                        <Button variant="outline" className="w-full gap-2 h-12 text-base">
                            <Home className="h-4 w-4" />
                            Voltar para o Início
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    if (!order) {
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Pedido não encontrado.</div>
    }

    // Check if already signed (Client-side protection)
    if (order.status !== 'open' && order.status !== 'analyzing' && !success) {
        // Optionally render "Already Signed" view here contextually
        // But server protection is more important
    }

    return (
        <div className="min-h-screen bg-background p-4 flex flex-col items-center py-12">

            <div className="max-w-md w-full space-y-6">

                <div className="text-center space-y-2">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
                        <FileSignature className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Termo de Retirada</h1>
                    <p className="text-muted-foreground text-sm">OS #{String(order.display_id).padStart(4, '0')} • {order.customer?.name}</p>
                </div>

                <Card className="border-border/60 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Resumo da Coleta</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6 text-sm">

                        {/* Equipamento */}
                        <div className="flex items-start gap-3">
                            <Package className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-foreground">Equipamento</h3>
                                <p className="text-muted-foreground">{order.equipment?.type} {order.equipment?.brand} {order.equipment?.model}</p>
                                <p className="text-xs text-muted-foreground/70">S/N: {order.equipment?.serial_number || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Acessórios */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Acessórios Coletados</h3>
                            {order.accessories_received && order.accessories_received.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {order.accessories_received.map((a: string) => (
                                        <span key={a} className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-xs font-medium border border-border">{a}</span>
                                    ))}
                                </div>
                            ) : <p className="text-muted-foreground italic text-xs">Nenhum acessório registrado.</p>}
                        </div>

                        {/* Condições */}
                        <div className="bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldAlert className="h-4 w-4 text-yellow-600" />
                                <h3 className="font-semibold text-yellow-700 text-xs uppercase">Estado Físico Reportado</h3>
                            </div>
                            <p className="text-foreground/80 leading-relaxed text-xs">
                                {order.custody_conditions || 'Sem avarias visíveis.'}
                            </p>
                        </div>

                        <div className="border-t border-dashed my-4" />

                        {/* Termo Legal */}
                        <div className="text-xs text-muted-foreground leading-relaxed h-32 overflow-y-auto bg-muted/30 p-3 rounded border">
                            <p className="font-bold mb-2">Termos e Condições:</p>
                            <p>Eu, {order.customer?.name}, declaro ser o responsável pelo equipamento acima descrito e autorizo sua retirada para análise técnica.</p>
                            <p className="mt-2">Confirmo que a lista de acessórios e a descrição das condições físicas conferem com a realidade no momento da entrega.</p>
                            <p className="mt-2">Concordo com o registro do meu IP e Geolocalização como assinatura digital deste termo.</p>
                        </div>

                        {/* Location Step */}
                        <div className="p-4 bg-muted/50 rounded-xl border border-dashed flex flex-col items-center gap-3 text-center">
                            <div className="p-2 bg-background rounded-full border shadow-sm">
                                <MapPin className={cn("h-6 w-6", geolocation ? "text-green-500" : "text-muted-foreground")} />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">Localização Obrigatória</h4>
                                <p className="text-xs text-muted-foreground">
                                    {geolocation
                                        ? "Localização capturada com sucesso."
                                        : "É necessário registrar o local da retirada."
                                    }
                                </p>
                            </div>
                            <Button
                                variant={geolocation ? "outline" : "default"}
                                onClick={handleCaptureLocation}
                                disabled={submitting}
                                size="sm"
                                className={cn(geolocation && "border-green-500 text-green-600")}
                            >
                                {submitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                {geolocation ? 'Atualizar Localização' : 'Capturar Localização'}
                            </Button>
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox
                                id="terms"
                                checked={acceptedTerms}
                                onCheckedChange={(c) => setAcceptedTerms(c === true)}
                                className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Li e concordo com os termos acima
                                </Label>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg h-12 text-base"
                    onClick={handleSign}
                    disabled={submitting || !acceptedTerms || !geolocation}
                >
                    {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                    Assinar e Confirmar
                </Button>

            </div>
        </div>
    )
}
