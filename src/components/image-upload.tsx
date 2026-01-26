'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Icons
import {
    Upload,
    X,
    Loader2,
    Camera,
    CheckCircle,
    AlertCircle,
    Trash2,
    ZoomIn,
} from 'lucide-react'

interface ImageUploadProps {
    orderId: string
    type: 'checkin' | 'checkout'
    existingImages?: string[]
    onUploadComplete?: (urls: string[]) => void
    disabled?: boolean
}

export default function ImageUpload({
    orderId,
    type,
    existingImages = [],
    onUploadComplete,
    disabled = false,
}: ImageUploadProps) {
    const [images, setImages] = useState<string[]>(existingImages)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    // Criar cliente Supabase no browser
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        setError(null)
        setUploadProgress(0)

        const newUrls: string[] = []
        const totalFiles = files.length

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]

                // Validar tipo de arquivo
                if (!file.type.startsWith('image/')) {
                    setError(`Arquivo "${file.name}" não é uma imagem válida`)
                    continue
                }

                // Validar tamanho (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    setError(`Arquivo "${file.name}" excede 5MB`)
                    continue
                }

                // Gerar nome único
                const timestamp = Date.now()
                const ext = file.name.split('.').pop()
                const fileName = `${orderId}/${type}/${timestamp}_${i}.${ext}`

                // Upload para Supabase Storage
                const { data, error: uploadError } = await supabase.storage
                    .from('os-evidence')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false,
                    })

                if (uploadError) {
                    console.error('Erro no upload:', uploadError)
                    setError(`Erro ao enviar "${file.name}": ${uploadError.message}`)
                    continue
                }

                // Obter URL pública
                const { data: urlData } = supabase.storage
                    .from('os-evidence')
                    .getPublicUrl(data.path)

                newUrls.push(urlData.publicUrl)
                setUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
            }

            // Atualizar estado local
            const allImages = [...images, ...newUrls]
            setImages(allImages)

            // Callback para componente pai
            if (onUploadComplete) {
                onUploadComplete(allImages)
            }

        } catch (err) {
            console.error('Erro inesperado:', err)
            setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Desconhecido'}`)
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
            // Limpar input
            e.target.value = ''
        }
    }, [images, orderId, type, supabase, onUploadComplete])

    const handleRemoveImage = async (url: string) => {
        try {
            // Extrair path da URL
            const urlObj = new URL(url)
            const pathParts = urlObj.pathname.split('/os-evidence/')
            if (pathParts.length < 2) return

            const filePath = pathParts[1]

            // Deletar do Storage
            const { error } = await supabase.storage
                .from('os-evidence')
                .remove([filePath])

            if (error) {
                console.error('Erro ao deletar:', error)
                setError(`Erro ao remover imagem: ${error.message}`)
                return
            }

            // Atualizar estado
            const newImages = images.filter(img => img !== url)
            setImages(newImages)

            if (onUploadComplete) {
                onUploadComplete(newImages)
            }
        } catch (err) {
            console.error('Erro ao remover:', err)
        }
    }

    const typeLabels = {
        checkin: {
            title: '📥 Fotos de Entrada (Check-in)',
            description: 'Registre o estado do aparelho ao receber',
        },
        checkout: {
            title: '📤 Fotos de Saída (Check-out)',
            description: 'Registre o estado do aparelho ao entregar',
        },
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <Label className="text-base font-semibold">{typeLabels[type].title}</Label>
                <p className="text-sm text-muted-foreground">{typeLabels[type].description}</p>
            </div>

            {/* Error */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={disabled || isUploading}
                    className="hidden"
                    id={`upload-${type}`}
                />
                <label
                    htmlFor={`upload-${type}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <span className="text-sm text-muted-foreground">
                                Enviando... {uploadProgress}%
                            </span>
                        </>
                    ) : (
                        <>
                            <Camera className="h-10 w-10 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Clique para adicionar fotos
                            </span>
                            <span className="text-xs text-muted-foreground">
                                JPG, PNG ou WEBP (máx. 5MB cada)
                            </span>
                        </>
                    )}
                </label>
            </div>

            {/* Image Gallery */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((url, index) => (
                        <div
                            key={url}
                            className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                        >
                            <Image
                                src={url}
                                alt={`${type} ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />

                            {/* Overlay com ações */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8"
                                    onClick={() => setPreviewImage(url)}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                {!disabled && (
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8"
                                        onClick={() => handleRemoveImage(url)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Badge com número */}
                            <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Contador */}
            {images.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{images.length} foto(s) registrada(s)</span>
                </div>
            )}

            {/* Modal de Preview (simples) */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <Image
                            src={previewImage}
                            alt="Preview"
                            width={1200}
                            height={800}
                            className="object-contain max-h-[90vh]"
                        />
                        <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
