'use client'

import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eraser } from 'lucide-react'

interface SignaturePadProps {
    onChange?: (isEmpty: boolean) => void
    onEnd?: (dataUrl: string) => void
}

export interface SignaturePadRef {
    clear: () => void
    isEmpty: () => boolean
    getTrimmedCanvas: () => HTMLCanvasElement
    toDataURL: () => string
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({ onChange, onEnd }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null)
    const [isEmpty, setIsEmpty] = useState(true)
    const containerRef = useRef<HTMLDivElement>(null)
    const [canvasWidth, setCanvasWidth] = useState(300)

    // Resize canvas responsively
    useEffect(() => {
        const resizeCanvas = () => {
            if (containerRef.current) {
                setCanvasWidth(containerRef.current.offsetWidth)
            }
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)
        return () => window.removeEventListener('resize', resizeCanvas)
    }, [])

    useImperativeHandle(ref, () => ({
        clear: () => {
            sigCanvas.current?.clear()
            setIsEmpty(true)
            onChange?.(true)
        },
        isEmpty: () => {
            return sigCanvas.current?.isEmpty() ?? true
        },
        getTrimmedCanvas: () => {
            return sigCanvas.current?.getTrimmedCanvas() as HTMLCanvasElement
        },
        toDataURL: () => {
            return sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') || ''
        }
    }))

    const handleEnd = () => {
        const empty = sigCanvas.current?.isEmpty() ?? true
        setIsEmpty(empty)
        onChange?.(empty)
        if (!empty) {
            onEnd?.(sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') || '')
        }
    }

    const handleClear = () => {
        sigCanvas.current?.clear()
        setIsEmpty(true)
        onChange?.(true)
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
                <Label className="text-sm font-medium text-gray-700">Assinatura do Cliente</Label>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    type="button"
                    disabled={isEmpty}
                    className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Eraser className="mr-1 h-3 w-3" />
                    Limpar
                </Button>
            </div>

            <div
                ref={containerRef}
                className="border-2 border-dashed border-gray-300 rounded-xl bg-white touch-none hover:border-blue-400 transition-colors shadow-sm"
                style={{ height: 220 }}
            >
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        width: canvasWidth,
                        height: 216,
                        className: 'cursor-crosshair w-full h-full rounded-xl'
                    }}
                    onEnd={handleEnd}
                    backgroundColor="rgba(255,255,255,0)"
                />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
                Use o dedo ou mouse para assinar dentro da área pontilhada.
            </p>
        </div>
    )
})

SignaturePad.displayName = 'SignaturePad'

export default SignaturePad
