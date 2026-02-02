'use client'

import { useState } from 'react'
import { Upload, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { uploadTelemetry } from '@/app/dashboard/orders/actions/telemetry'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { useRouter } from 'next/navigation'

interface TelemetryUploadProps {
    orderId: string
    equipmentId: string
    tenantId: string
    onUploadSuccess?: () => void
}

export function TelemetryUpload({ orderId, equipmentId, tenantId, onUploadSuccess }: TelemetryUploadProps) {
    const router = useRouter()
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [stage, setStage] = useState<'initial' | 'post_repair' | 'final'>('initial')

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            await processFile(files[0])
        }
    }

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await processFile(e.target.files[0])
        }
    }

    const processFile = async (file: File) => {
        setError(null)

        // Validate Extension
        const validExtensions = ['.txt', '.csv', '.log']
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
        if (!validExtensions.includes(ext)) {
            setError('Formato inválido. Use .txt (CrystalDiskInfo), .csv ou .log (HWiNFO).')
            return
        }

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        // We'll pass tenantId as a separate argument to the server action, 
        // OR we can append it to formData. 
        // Let's modify the server action to take it as argument, it's cleaner.

        try {
            const result = await uploadTelemetry(orderId, equipmentId, tenantId, formData, stage)
            if (result.success) {
                if (onUploadSuccess) {
                    onUploadSuccess()
                } else {
                    router.refresh()
                }
            } else {
                setError(result.error || 'Erro ao processar arquivo.')
            }
        } catch (err) {
            setError('Erro de conexão com o servidor.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Card className={`border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="p-3 bg-muted rounded-full">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Upload de Logs de Hardware</h3>
                    <p className="text-sm text-muted-foreground">
                        Arraste arquivos <b>CrystalDiskInfo (.txt)</b> ou <b>HWiNFO (.csv, .log)</b>
                    </p>
                </div>

                <div className="w-full max-w-md space-y-3">
                    <Label className="text-sm font-medium">Estágio da Telemetria</Label>
                    <RadioGroup value={stage} onValueChange={(v) => setStage(v as typeof stage)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="initial" id="initial" />
                            <Label htmlFor="initial" className="font-normal cursor-pointer">Diagnóstico Inicial</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="post_repair" id="post_repair" />
                            <Label htmlFor="post_repair" className="font-normal cursor-pointer">Pós-Reparo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="final" id="final" />
                            <Label htmlFor="final" className="font-normal cursor-pointer">Entrega Final</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="flex gap-2">
                    <Button
                        disabled={isUploading}
                        variant="outline"
                        onClick={() => document.getElementById('telemetry-upload')?.click()}
                    >
                        {isUploading ? 'Processando...' : 'Selecionar Arquivo'}
                    </Button>
                    <input
                        id="telemetry-upload"
                        type="file"
                        accept=".txt,.csv,.log"
                        className="hidden"
                        onChange={handleFileInput}
                    />
                </div>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}
