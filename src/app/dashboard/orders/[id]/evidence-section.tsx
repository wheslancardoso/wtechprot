'use client'

import { useState } from 'react'
import ImageUpload from '@/components/image-upload'
import WhatsAppButton from '@/components/whatsapp-button'
import { saveEvidencePhotos } from '../actions'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

// Icons
import {
    Camera,
    CheckCircle,
    AlertCircle,
    Save,
    Loader2,
} from 'lucide-react'

interface EvidenceSectionProps {
    orderId: string
    status: string
    customerName: string
    customerPhone: string
    displayId: number
    laborCost?: number
    photosCheckin?: string[]
    photosCheckout?: string[]
}

export default function EvidenceSection({
    orderId,
    status,
    customerName,
    customerPhone,
    displayId,
    laborCost,
    photosCheckin = [],
    photosCheckout = [],
}: EvidenceSectionProps) {
    const [checkinPhotos, setCheckinPhotos] = useState<string[]>(photosCheckin)
    const [checkoutPhotos, setCheckoutPhotos] = useState<string[]>(photosCheckout)
    const [isSaving, setIsSaving] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Determinar se pode editar
    const canEditCheckin = ['open', 'analyzing'].includes(status)
    const canEditCheckout = ['in_progress', 'ready'].includes(status)

    // Salvar fotos no banco
    async function handleSavePhotos(type: 'checkin' | 'checkout') {
        setIsSaving(true)
        setFeedback(null)

        try {
            const photos = type === 'checkin' ? checkinPhotos : checkoutPhotos
            const result = await saveEvidencePhotos(orderId, type, photos)

            if (result.success) {
                setFeedback({ type: 'success', message: result.message })
            } else {
                setFeedback({ type: 'error', message: result.message })
            }
        } catch (error) {
            setFeedback({
                type: 'error',
                message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Gerar link público
    const publicLink = typeof window !== 'undefined'
        ? `${window.location.origin}/os/${orderId}`
        : `https://seudominio.com/os/${orderId}`

    return (
        <div className="space-y-6">
            {/* Feedback */}
            {feedback && (
                <Alert variant={feedback.type === 'success' ? 'success' : 'destructive'}>
                    {feedback.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
            )}

            {/* Botão WhatsApp */}
            {customerPhone && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            📱 Comunicação
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <WhatsAppButton
                            phone={customerPhone}
                            customerName={customerName}
                            orderId={orderId}
                            displayId={displayId}
                            status={status}
                            laborCost={laborCost}
                            publicLink={publicLink}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Card Evidências Check-in */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Camera className="h-5 w-5" />
                        Evidências Fotográficas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Check-in */}
                    <div className="space-y-4">
                        <ImageUpload
                            orderId={orderId}
                            type="checkin"
                            existingImages={checkinPhotos}
                            onUploadComplete={setCheckinPhotos}
                            disabled={!canEditCheckin}
                        />
                        {canEditCheckin && checkinPhotos.length > 0 && (
                            <Button
                                onClick={() => handleSavePhotos('checkin')}
                                disabled={isSaving}
                                className="w-full sm:w-auto"
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Salvar Fotos de Entrada
                            </Button>
                        )}
                    </div>

                    <hr />

                    {/* Check-out */}
                    <div className="space-y-4">
                        <ImageUpload
                            orderId={orderId}
                            type="checkout"
                            existingImages={checkoutPhotos}
                            onUploadComplete={setCheckoutPhotos}
                            disabled={!canEditCheckout}
                        />
                        {canEditCheckout && checkoutPhotos.length > 0 && (
                            <Button
                                onClick={() => handleSavePhotos('checkout')}
                                disabled={isSaving}
                                className="w-full sm:w-auto"
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Salvar Fotos de Saída
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
