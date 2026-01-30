'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import type { SignaturePadRef } from '@/components/ui/signature-pad'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

const SignaturePad = dynamic(() => import('@/components/ui/signature-pad'), {
    ssr: false,
    loading: () => <div className="h-[220px] w-full bg-muted rounded-xl animate-pulse" />
})
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    CheckCircle2,
    Package,
    PenTool,
    ShieldAlert,
    Upload,
    Loader2,
    Check
} from 'lucide-react'

// --- Types ---
type Step = 'accessories' | 'photos' | 'conditions' | 'signature' | 'review'

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
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()
    const sigPadRef = useRef<SignaturePadRef>(null)

    // Form State
    const [accessories, setAccessories] = useState<string[]>([])
    const [customAccessory, setCustomAccessory] = useState('')
    const [conditions, setConditions] = useState('')
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null)
    const [photos, setPhotos] = useState<{ label: string; url: string }[]>([
        { label: 'Frente', url: '' },
        { label: 'Verso', url: '' },
        { label: 'Laterais', url: '' },
        { label: 'Tela Ligada', url: '' }
    ])

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

    const handleSignatureEnd = (dataUrl: string) => {
        setSignatureUrl(dataUrl)
    }

    const validateStep = () => {
        // PHOTOS OPTIONAL FOR TESTING
        // if (step === 'photos') {
        //     const missingPhotos = photos.filter(p => !p.url)
        //     if (missingPhotos.length > 0) {
        //         toast({
        //             title: 'Fotos obrigatórias',
        //             description: `Faltam: ${missingPhotos.map(p => p.label).join(', ')}`,
        //             variant: 'destructive'
        //         })
        //         return false
        //     }
        // }
        if (step === 'signature' && !signatureUrl) {
            toast({ title: 'Assinatura necessária', description: 'O cliente precisa assinar para continuar.', variant: 'destructive' })
            return false
        }
        return true
    }

    const handleNext = () => {
        if (!validateStep()) return

        const steps: Step[] = ['accessories', 'photos', 'conditions', 'signature', 'review']
        const currentIndex = steps.indexOf(step)
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1])
        }
    }

    const handleBack = () => {
        const steps: Step[] = ['accessories', 'photos', 'conditions', 'signature', 'review']
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
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

            if (!isUuid) {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('display_id', id)
                    .single()

                if (orderError || !orderData) throw new Error('Pedido não encontrado')
                targetUuid = orderData.id
            }

            const signatureBlob = await (await fetch(signatureUrl!)).blob()
            const sigFile = new File([signatureBlob], 'signature.png', { type: 'image/png' })
            const sigPath = `signatures/${targetUuid}-${Date.now()}.png`

            const { error: sigUploadError } = await supabase.storage
                .from('order-evidence')
                .upload(sigPath, sigFile)

            if (sigUploadError) throw sigUploadError

            const { data: { publicUrl: sigPublicUrl } } = supabase.storage
                .from('order-evidence')
                .getPublicUrl(sigPath)


            const { error } = await supabase
                .from('orders')
                .update({
                    accessories_received: accessories,
                    custody_conditions: conditions,
                    custody_signature_url: sigPublicUrl,
                    custody_signed_at: new Date().toISOString(),
                    status: 'analyzing'
                })
                .eq('id', targetUuid)

            if (error) throw error

            toast({
                title: 'Check-in Concluído! 🎉',
                description: 'Termo gerado e ordem atualizada com sucesso.',
                className: 'bg-green-600 text-white'
            })

            router.push(`/dashboard/orders/${targetUuid}`)

        } catch (error) {
            console.error(error)
            toast({ title: 'Erro ao salvar', description: 'Tente novamente.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    // --- Headers & Progress ---
    const getStepTitle = () => {
        switch (step) {
            case 'accessories': return 'Acessórios & Itens'
            case 'photos': return 'Fotos do Estado'
            case 'conditions': return 'Condições Físicas'
            case 'signature': return 'Assinatura Digital'
            case 'review': return 'Revisão Final'
        }
    }

    const progress =
        (step === 'accessories' ? 20 :
            step === 'photos' ? 40 :
                step === 'conditions' ? 60 :
                    step === 'signature' ? 80 : 100)

    return (
        <div className="min-h-screen bg-background pb-24 font-sans text-foreground">
            {/* Top Bar */}
            <header className="bg-card border-b border-border/40 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-accent cursor-pointer">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                    <h1 className="text-sm font-semibold">Retirada Domiciliar</h1>
                    <p className="text-xs text-muted-foreground">Passo {progress / 20} de 5</p>
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
                        {step === 'signature' && <PenTool className="h-7 w-7" />}
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

                {step === 'signature' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-card border p-5 rounded-xl text-xs text-muted-foreground leading-relaxed font-mono shadow-sm">
                            <p className="font-bold mb-3 text-sm text-foreground">TERMO DE CUSTÓDIA:</p>
                            <ul className="space-y-2 list-disc pl-4">
                                <li>Declaro entregar o equipamento descrito para análise.</li>
                                <li>Confirmo que os acessórios listados e danos registrados conferem com a realidade.</li>
                                <li>Autorizo o transporte para a assistência técnica.</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            {/* Component handles its own styling now */}
                            <SignaturePad ref={sigPadRef} onEnd={handleSignatureEnd} />
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
                                <div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">Assinatura</span>
                                    {signatureUrl && (
                                        <div className="h-24 w-full bg-background border border-border rounded-xl flex items-center justify-center overflow-hidden">
                                            <img src={signatureUrl} alt="Assinatura" className="max-h-full object-contain p-2" />
                                        </div>
                                    )}
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
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-green-900/20 shadow-lg" onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Confirmar Coleta
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
