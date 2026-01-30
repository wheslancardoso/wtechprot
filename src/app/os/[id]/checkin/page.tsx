'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { saveCheckinData } from '../actions'
import QRCode from 'qrcode'

import {
    ArrowLeft,
    ArrowRight,
    Camera,
    CheckCircle2,
    Package,
    ShieldAlert,
    Upload,
    Loader2,
    Check,
    Share2,
    QrCode as QrCodeIcon,
    Smartphone,
    Link as LinkIcon
} from 'lucide-react'

// --- Types ---
type Step = 'accessories' | 'photos' | 'conditions' | 'review'

const COMMON_ACCESSORIES = [
    'Carregador / Fonte',
    'Cabo de Energia',
    'Capa / Case',
    'Mouse / Teclado Ext.',
    'Bateria (Removível)'
]

interface CheckinPageProps {
    params: Promise<{ id: string }>
}

export default function CheckinPage({ params }: CheckinPageProps) {
    const [step, setStep] = useState<Step>('accessories')
    const [loading, setLoading] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [publicSignUrl, setPublicSignUrl] = useState('')
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')

    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    // Form State
    const [accessories, setAccessories] = useState<string[]>([])
    const [customAccessory, setCustomAccessory] = useState('')
    const [conditions, setConditions] = useState('')

    const [photos, setPhotos] = useState<{ label: string; url: string }[]>([
        { label: 'Frente', url: '' },
        { label: 'Verso', url: '' },
        { label: 'Laterais', url: '' },
        { label: 'Tela Ligada', url: '' }
    ])

    // --- Generate QR Code ---
    useEffect(() => {
        if (publicSignUrl) {
            QRCode.toDataURL(publicSignUrl, { width: 300, margin: 2 }, (err, url) => {
                if (!err) setQrCodeDataUrl(url)
            })
        }
    }, [publicSignUrl])

    // --- Handlers ---

    const handleAccessoryToggle = (item: string) => {
        setAccessories(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        )
    }

    const handleAddCustomAccessory = () => {
        if (customAccessory.trim()) {
            setAccessories(prev => [...prev, customAccessory.trim()])
            setCustomAccessory('')
        }
    }

    const handlePhotoUpload = async (index: number, file: File) => {
        try {
            setLoading(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `home-care-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `checkin/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('order-evidence')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('order-evidence')
                .getPublicUrl(filePath)

            setPhotos(prev => {
                const newPhotos = [...prev]
                newPhotos[index].url = publicUrl
                return newPhotos
            })

            toast({ title: 'Foto enviada!', description: 'Imagem carregada com sucesso.' })
        } catch (error) {
            console.error(error)
            toast({ title: 'Erro no upload', description: 'Não foi possível enviar a foto.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        const steps: Step[] = ['accessories', 'photos', 'conditions', 'review']
        const currentIndex = steps.indexOf(step)
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1])
        }
    }

    const handleBack = () => {
        const steps: Step[] = ['accessories', 'photos', 'conditions', 'review']
        const currentIndex = steps.indexOf(step)
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1])
        }
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const resolvedParams = await params
            const { id } = resolvedParams

            let targetUuid = id
            let displayId: number | string = ''

            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

            let query = supabase.from('orders').select('id, display_id')

            if (isUuid) {
                query = query.eq('id', id)
            } else {
                query = query.eq('display_id', id)
            }

            const { data: orderData, error: orderError } = await query.single()

            if (orderError || !orderData) {
                console.error('Erro ao buscar pedido:', orderError)
                throw new Error('Pedido não encontrado')
            }
            targetUuid = orderData.id
            displayId = orderData.display_id

            // Salvar Check-in (Sem assinar ainda)
            const result = await saveCheckinData(targetUuid, {
                accessories,
                conditions,
            })

            if (!result.success) throw new Error(result.message)

            // Construir URL Pública
            const origin = window.location.origin
            const signLink = `${origin}/public/sign/${displayId}`
            setPublicSignUrl(signLink)
            setCompleted(true)

            toast({
                title: 'Dados Salvos! 💾',
                description: 'Aguardando assinatura do cliente.',
            })

        } catch (error) {
            console.error(error)
            toast({
                title: 'Erro ao salvar',
                description: error instanceof Error ? error.message : 'Falha desconhecida.',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    // --- Success View (QR & Link) ---
    if (completed) {
        return (
            <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                <div className="max-w-md w-full space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-xl font-bold">Check-in Registrado!</h1>
                        <p className="text-sm text-muted-foreground">O cliente precisa assinar para finalizar.</p>
                    </div>

                    <Card className="border-border shadow-md overflow-hidden">
                        <CardHeader className="bg-muted/50 pb-3 border-b border-border/60">
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider flex items-center justify-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                Assinatura no Dispositivo do Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">

                            {/* Link Actions (Primary) */}
                            <div className="space-y-3">
                                <Button
                                    className="w-full h-12 text-base bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/10"
                                    onClick={() => {
                                        const text = `Olá! Clique aqui para assinar o termo de retirada do seu equipamento: ${publicSignUrl}`
                                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                                    }}
                                >
                                    <Share2 className="mr-2 h-5 w-5" />
                                    Enviar no WhatsApp
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        navigator.clipboard.writeText(publicSignUrl)
                                        toast({ title: 'Copiado!', description: 'Link copiado para a área de transferência.' })
                                    }}
                                >
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    Copiar Link de Assinatura
                                </Button>
                            </div>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Presencial?</span></div>
                            </div>

                            {/* QR Section (Secondary) */}
                            <div className="flex flex-col items-center gap-4 bg-muted/30 p-4 rounded-xl border border-dashed">
                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                    <QrCodeIcon className="h-4 w-4" />
                                    Opção QR Code
                                </p>
                                <div className="p-2 bg-white rounded-lg border shadow-sm w-32 h-32 flex items-center justify-center">
                                    {qrCodeDataUrl ? (
                                        <Image
                                            src={qrCodeDataUrl}
                                            alt="QR Code Assinatura"
                                            width={120}
                                            height={120}
                                            className="mix-blend-multiply"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-muted animate-pulse rounded" />
                                    )}
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <Button variant="ghost" className="mt-4 text-muted-foreground" onClick={() => router.push(`/dashboard/orders`)}>
                        Voltar para a Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    // --- Headers & Progress ---
    const getStepTitle = () => {
        switch (step) {
            case 'accessories': return 'Acessórios & Itens'
            case 'photos': return 'Fotos do Estado'
            case 'conditions': return 'Condições Físicas'
            case 'review': return 'Salvar & Gerar Link'
        }
    }

    const progress =
        (step === 'accessories' ? 25 :
            step === 'photos' ? 50 :
                step === 'conditions' ? 75 : 100)

    return (
        <div className="min-h-screen bg-background pb-24 font-sans text-foreground">
            {/* Top Bar */}
            <header className="bg-card border-b border-border/40 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-accent cursor-pointer">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                    <h1 className="text-sm font-semibold">Retirada Domiciliar</h1>
                    <p className="text-xs text-muted-foreground">Passo {progress / 25} de 4</p>
                </div>
                <div className="w-9" />
            </header>

            {/* Progress Bar */}
            <div className="h-1 bg-muted">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <main className="p-4 max-w-lg mx-auto space-y-6 mt-4">

                <div className="text-center mb-8">
                    <div className={cn(
                        "inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 shadow-sm",
                        "bg-primary/10 text-primary ring-1 ring-primary/20"
                    )}>
                        {step === 'accessories' && <Package className="h-7 w-7" />}
                        {step === 'photos' && <Camera className="h-7 w-7" />}
                        {step === 'conditions' && <ShieldAlert className="h-7 w-7" />}
                        {step === 'review' && <CheckCircle2 className="h-7 w-7" />}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">{getStepTitle()}</h2>
                </div>

                {/* --- STEPS --- */}

                {step === 'accessories' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Label className="text-muted-foreground ml-1">Selecione o que está sendo coletado:</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {COMMON_ACCESSORIES.map(item => {
                                const isSelected = accessories.includes(item)
                                return (
                                    <div
                                        key={item}
                                        onClick={() => handleAccessoryToggle(item)}
                                        className={cn(
                                            "relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group select-none flex items-center gap-3",
                                            isSelected
                                                ? "bg-primary/5 border-primary shadow-sm"
                                                : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                                        )}
                                    >
                                        <div className={cn(
                                            "shrink-0 h-6 w-6 rounded-full border-2 transition-colors flex items-center justify-center",
                                            isSelected
                                                ? "bg-primary border-primary"
                                                : "border-muted-foreground/30 group-hover:border-primary"
                                        )}>
                                            {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                                        </div>
                                        <span className={cn(
                                            "font-medium text-base",
                                            isSelected ? "text-primary" : "text-foreground"
                                        )}>{item}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="pt-6 border-t border-border">
                            <Label className="text-xs text-muted-foreground mb-3 block uppercase tracking-wider font-semibold">Outro Item</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ex: Adaptador HDMI..."
                                    value={customAccessory}
                                    onChange={(e) => setCustomAccessory(e.target.value)}
                                    className="bg-card"
                                />
                                <Button variant="secondary" onClick={handleAddCustomAccessory} disabled={!customAccessory}>
                                    Adicionar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'photos' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-600 dark:text-yellow-500 flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-1">Registro de Segurança</p>
                                <p className="opacity-90">Fotos são obrigatórias para proteger a loja e o cliente contra reclamações futuras de danos.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {photos.map((photo, index) => (
                                <Card key={index} className="overflow-hidden border-border/60 hover:border-primary/50 transition-colors">
                                    <div className="aspect-square relative flex items-center justify-center bg-muted/50">
                                        {photo.url ? (
                                            <Image
                                                src={photo.url}
                                                alt={photo.label}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Upload className="h-10 w-10 text-muted-foreground/40" />
                                        )}
                                        {loading && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
                                    </div>
                                    <div className="p-3 border-t bg-card">
                                        <p className="text-xs font-semibold mb-3 text-center">{photo.label}</p>
                                        <Label
                                            htmlFor={`photo-${index}`}
                                            className={cn(
                                                "flex items-center justify-center w-full py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
                                                photo.url
                                                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                                            )}
                                        >
                                            <Camera className="h-4 w-4 mr-2" />
                                            {photo.url ? 'Alterar' : 'Capturar'}
                                        </Label>
                                        <Input
                                            id={`photo-${index}`}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) handlePhotoUpload(index, e.target.files[0])
                                            }}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'conditions' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Label className="text-base">Descreva avarias visíveis</Label>
                        <Textarea
                            placeholder="Ex: Risco profundo na tampa traseira, tela com trinco no canto superior, amassado na quina..."
                            className="min-h-[200px] text-base p-4 leading-relaxed bg-card text-foreground resize-none focus-visible:ring-primary"
                            value={conditions}
                            onChange={(e) => setConditions(e.target.value)}
                        />
                        <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl text-sm border border-border/50">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            <span className="text-muted-foreground">Caso o aparelho esteja impecável, escreva "Sem avarias visíveis".</span>
                        </div>
                    </div>
                )}

                {step === 'review' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-border/60 shadow-lg">
                            <CardContent className="pt-6 space-y-6 text-sm">
                                <div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">Itens Coletados</span>
                                    {accessories.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {accessories.map(a => (
                                                <span key={a} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-primary/20">{a}</span>
                                            ))}
                                        </div>
                                    ) : <span className="text-muted-foreground italic">Nenhum acessório</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {photos.slice(0, 2).map((p, i) => p.url && (
                                        <div key={i} className="aspect-video relative rounded-lg overflow-hidden bg-muted border">
                                            <Image src={p.url} alt="Evidencia" fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Estado Físico</span>
                                    <p className="bg-muted/50 p-4 rounded-lg border border-border/50 text-foreground leading-relaxed">{conditions || 'Nenhuma observação'}</p>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-sm text-blue-700 flex items-start gap-3">
                                    <Share2 className="h-5 w-5 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold mb-1">Próximo Passo:</p>
                                        <p>Ao confirmar, um link será gerado para ser enviado ao cliente via <strong>WhatsApp</strong> (ou QR Code se preferir).</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </main>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border/60 flex justify-between items-center gap-4 z-50 supports-[backdrop-filter]:bg-background/60">
                {step !== 'accessories' && (
                    <Button variant="secondary" size="lg" onClick={handleBack} disabled={loading} className="w-1/3">
                        Voltar
                    </Button>
                )}

                {step === 'review' ? (
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20 shadow-lg" onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Gerar Link de Assinatura
                    </Button>
                ) : (
                    <Button size="lg" className={cn("w-full shadow-lg", step === 'accessories' ? "w-full" : "w-2/3")} onClick={handleNext} disabled={loading}>
                        Próximo <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    )
}
