'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

// Icons
import { Share2, Copy, MessageCircle, Link, Check } from 'lucide-react'

// ==================================================
// Props
// ==================================================
interface ShareActionsProps {
    orderId: string
    displayId: number | string
    customerName: string
    storeName?: string
    className?: string
}

// ==================================================
// Component
// ==================================================
export default function ShareActions({
    orderId,
    displayId,
    customerName,
    storeName = 'WTECH',
    className,
}: ShareActionsProps) {
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    const osNumber = String(displayId).padStart(4, '0')
    // Usar displayId na URL para ser "amigável" (agora suportado pelo page.tsx)
    const trackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/os/${displayId}`

    // Copiar link
    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(trackingUrl)
            setCopied(true)
            toast({
                title: 'Link copiado!',
                description: 'Cole o link para enviar ao cliente.',
            })
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast({
                title: 'Erro ao copiar',
                description: 'Copie manualmente: ' + trackingUrl,
                variant: 'destructive',
            })
        }
    }

    // Enviar WhatsApp
    function handleWhatsApp() {
        const firstName = customerName.split(' ')[0]
        const message = `Olá ${firstName}! 👋

Acompanhe o status do reparo da sua OS #${osNumber} em tempo real neste link seguro:

🔗 ${trackingUrl}

Atenciosamente,
${storeName}`

        const encodedMessage = encodeURIComponent(message)
        window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={className}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartilhar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                    {copied ? (
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                        <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copiar Link de Rastreamento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleWhatsApp}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar no WhatsApp
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// ==================================================
// Versão Inline (Botões separados)
// ==================================================
export function ShareActionsInline({
    orderId,
    displayId,
    customerName,
    storeName = 'WTECH',
}: ShareActionsProps) {
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    const osNumber = String(displayId).padStart(4, '0')
    // Usar displayId na URL para ser "amigável" (agora suportado pelo page.tsx)
    const trackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/os/${displayId}`

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(trackingUrl)
            setCopied(true)
            toast({
                title: 'Link copiado!',
                description: 'Cole o link para enviar ao cliente.',
            })
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast({
                title: 'Erro ao copiar',
                variant: 'destructive',
            })
        }
    }

    function handleWhatsApp() {
        const firstName = customerName.split(' ')[0]
        const message = `Olá ${firstName}! 👋

Acompanhe o status do reparo da sua OS #${osNumber} em tempo real:

🔗 ${trackingUrl}

Atenciosamente,
${storeName}`

        const encodedMessage = encodeURIComponent(message)
        window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank')
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
                {copied ? (
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                ) : (
                    <Link className="mr-2 h-4 w-4" />
                )}
                {copied ? 'Copiado!' : 'Copiar Link'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
            </Button>
        </div>
    )
}
