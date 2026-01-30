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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import type { SignaturePadRef } from '@/components/ui/signature-pad'
import dynamic from 'next/dynamic'

const SignaturePad = dynamic(() => import('@/components/ui/signature-pad'), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-gray-100 rounded-lg animate-pulse" />
})
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    CheckCircle2,
    Package,
    PenTool,
    ShieldAlert,
    Smartphone,
    Upload,
    Wrench,
    Loader2
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
        if (step === 'photos') {
            const missingPhotos = photos.filter(p => !p.url)
            if (missingPhotos.length > 0) {
                toast({
                    title: 'Fotos obrigatórias',
                    description: `Faltam: ${missingPhotos.map(p => p.label).join(', ')}`,
                    variant: 'destructive'
                })
                return false
            }
        }
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
            const { id } = resolvedParams // This acts as display_id or UUID depending on input, logic needed to resolve to UUID if it's display_id

            // Resolve ID (Assume we have the UUID or need to fetch it? For now let's hope it's the UUID or handle it)
            // Actually, in the other pages we check if it is UUID or DisplayID.
            // Let's assume for this "Tech Page" we passed the UUID or handle the query.

            // Fetch real UUID if necessary
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

            // Upload signature
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


            // Update database
            const { error } = await supabase
                .from('orders')
                .update({
                    accessories_received: accessories,
                    custody_conditions: conditions,
                    custody_signature_url: sigPublicUrl,
                    custody_signed_at: new Date().toISOString(),
                    // collected_by: technician_id (would imply auth context)
                    status: 'analyzing' // Move to analyzing or similar?
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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Top Bar */}
            <header className="bg-white border-b px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                    <h1 className="text-sm font-semibold text-gray-900">Retirada Domiciliar</h1>
                    <p className="text-xs text-gray-500">Passo {progress / 20} de 5</p>
                </div>
                <div className="w-9" /> {/* Spacer */}
            </header>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <main className="p-4 max-w-lg mx-auto space-y-6">

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                        {step === 'accessories' && <Package className="h-6 w-6" />}
                        {step === 'photos' && <Camera className="h-6 w-6" />}
                        {step === 'conditions' && <ShieldAlert className="h-6 w-6" />}
                        {step === 'signature' && <PenTool className="h-6 w-6" />}
                        {step === 'review' && <CheckCircle2 className="h-6 w-6" />}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{getStepTitle()}</h2>
                </div>

                {/* --- STEPS --- */}

                {step === 'accessories' && (
                    <div className="space-y-4">
                        <Label>O que estamos levando?</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {COMMON_ACCESSORIES.map(item => (
                                <div key={item}
                                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${accessories.includes(item)
                                        ? 'border-primary bg-primary/5'
                                        : 'border-transparent bg-white shadow-sm hover:bg-gray-50'
                                        }`}
                                    onClick={() => handleAccessoryToggle(item)}
                                >
                                    <Checkbox
                                        checked={accessories.includes(item)}
                                        onCheckedChange={() => handleAccessoryToggle(item)}
                                        className="mr-3"
                                    />
                                    <span className="font-medium text-sm">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t">
                            <Label className="text-xs text-muted-foreground mb-2 block">Item Personalizado / Outro</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ex: Adaptador HDMI..."
                                    value={customAccessory}
                                    onChange={(e) => setCustomAccessory(e.target.value)}
                                />
                                <Button variant="outline" onClick={handleAddCustomAccessory} disabled={!customAccessory}>
                                    Adicionar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'photos' && (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-4">
                            📸 Obrigatório registrar todos os ângulos para segurança.
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {photos.map((photo, index) => (
                                <Card key={index} className="overflow-hidden">
                                    <div className="aspect-square relative flex items-center justify-center bg-gray-100">
                                        {photo.url ? (
                                            <Image
                                                src={photo.url}
                                                alt={photo.label}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Upload className="h-8 w-8 text-gray-300" />
                                        )}
                                        {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                                    </div>
                                    <div className="p-2 border-t bg-white">
                                        <p className="text-xs font-medium mb-2 text-center">{photo.label}</p>
                                        <Label
                                            htmlFor={`photo-${index}`}
                                            className="flex items-center justify-center w-full py-1.5 bg-primary text-primary-foreground rounded text-xs cursor-pointer hover:bg-primary/90"
                                        >
                                            <Camera className="h-3 w-3 mr-1.5" />
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
                    <div className="space-y-4">
                        <Label>Descreva avarias visíveis (Riscos, amassados, trincas)</Label>
                        <Textarea
                            placeholder="Ex: Risco profundo na tampa traseira, tela com trinco no canto superior..."
                            className="min-h-[150px] text-base"
                            value={conditions}
                            onChange={(e) => setConditions(e.target.value)}
                        />
                        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <span>Caso o aparelho esteja impecável, escreva "Sem avarias visíveis".</span>
                        </div>
                    </div>
                )}

                {step === 'signature' && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 border p-4 rounded-lg text-xs text-gray-600 leading-relaxed font-mono">
                            <p className="font-bold mb-2">TERMO DE RESPONSABILIDADE E CUSTÓDIA:</p>
                            <p>1. Declaro entregar o equipamento descrito para análise técnica.</p>
                            <p>2. Confirmo que os acessórios listados e danos registrados conferem corn a realidade.</p>
                            <p>3. Autorizo o transporte para a WFIX Tech.</p>
                        </div>

                        <div className="space-y-2">
                            {/* Label handled inside component now */}
                            <SignaturePad ref={sigPadRef} onEnd={handleSignatureEnd} />
                        </div>
                    </div>
                )}

                {step === 'review' && (
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="pt-6 space-y-4 text-sm">
                                <div>
                                    <span className="font-bold text-gray-500 block mb-1">Acessórios</span>
                                    {accessories.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {accessories.map(a => (
                                                <span key={a} className="bg-gray-100 px-2 py-1 rounded-md text-xs">{a}</span>
                                            ))}
                                        </div>
                                    ) : <span className="text-gray-400 italic">Nenhum acessório</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {photos.slice(0, 2).map((p, i) => p.url && (
                                        <div key={i} className="aspect-video relative rounded-md overflow-hidden bg-gray-100">
                                            <Image src={p.url} alt="Evidencia" fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <span className="font-bold text-gray-500 block mb-1">Condições</span>
                                    <p className="bg-gray-50 p-2 rounded border border-gray-100">{conditions || 'Nenhuma observação'}</p>
                                </div>
                                <div>
                                    <span className="font-bold text-gray-500 block mb-1">Assinatura</span>
                                    {signatureUrl && (
                                        <div className="h-16 w-full bg-gray-50 border rounded flex items-center justify-center">
                                            <img src={signatureUrl} alt="Assinatura" className="max-h-full" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </main>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between items-center gap-4 z-50">
                {step !== 'accessories' && (
                    <Button variant="outline" onClick={handleBack} disabled={loading}>
                        Voltar
                    </Button>
                )}

                {step === 'review' ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Coleta
                    </Button>
                ) : (
                    <Button className="w-full" onClick={handleNext} disabled={loading}>
                        Próximo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
