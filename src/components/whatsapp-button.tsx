'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
    phone: string
    customerName: string
    orderId: string
    displayId: number
    status: string
    laborCost?: number
    publicLink: string
}

// Formata telefone para WhatsApp (remove caracteres e adiciona 55)
function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    // Se já tem 55, retorna limpo. Senão, adiciona 55
    if (cleaned.startsWith('55')) {
        return cleaned
    }
    return `55${cleaned}`
}

// Formata valor em BRL
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

// Gera mensagem baseada no status
function generateMessage(props: WhatsAppButtonProps): string {
    const { customerName, displayId, status, laborCost, publicLink } = props
    const firstName = customerName.split(' ')[0]
    const osNumber = String(displayId).padStart(4, '0')

    switch (status) {
        case 'waiting_approval':
            return `Olá ${firstName}! 👋

Seu orçamento técnico está pronto. 📋

*OS #${osNumber}*

Veja os detalhes, incluindo o link para compra da peça (se houver), e aprove o serviço aqui:
${publicLink}

Qualquer dúvida, estou à disposição!

_WTECH Soluções em Tecnologia_`

        case 'waiting_parts':
            return `Olá ${firstName}! 👋

Confirmo o recebimento da sua peça. ✅

*OS #${osNumber}*

Vou iniciar o reparo agora. Te aviso assim que estiver pronto!

_WTECH Soluções em Tecnologia_`

        case 'in_progress':
            return `Olá ${firstName}! 👋

Seu equipamento está em reparo! 🔧

*OS #${osNumber}*

Te aviso assim que estiver pronto para retirada.

_WTECH Soluções em Tecnologia_`

        case 'ready':
        case 'finished':
            return `Olá ${firstName}! 🎉

Seu equipamento está *PRONTO*! ✅

*OS #${osNumber}*
${laborCost ? `*Total Mão de Obra: ${formatCurrency(laborCost)}*` : ''}

Pode vir retirar quando quiser. Aceitamos PIX, dinheiro ou cartão.

Endereço: [Seu endereço aqui]
Horário: Seg-Sex 9h às 18h

_WTECH Soluções em Tecnologia_`

        default:
            return `Olá ${firstName}! 👋

Tenho uma atualização sobre sua OS #${osNumber}.

Veja os detalhes aqui: ${publicLink}

_WTECH Soluções em Tecnologia_`
    }
}

// Gera label do botão baseado no status
function getButtonLabel(status: string): string {
    switch (status) {
        case 'waiting_approval':
            return 'Enviar Orçamento'
        case 'waiting_parts':
            return 'Avisar Recebimento'
        case 'in_progress':
            return 'Atualizar Cliente'
        case 'ready':
        case 'finished':
            return 'Avisar Pronto'
        default:
            return 'Enviar WhatsApp'
    }
}

export default function WhatsAppButton(props: WhatsAppButtonProps) {
    const { phone, status } = props

    function handleClick() {
        const formattedPhone = formatPhone(phone)
        const message = generateMessage(props)
        const encodedMessage = encodeURIComponent(message)

        // Abrir WhatsApp Web ou App
        const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`
        window.open(url, '_blank')
    }

    return (
        <Button
            onClick={handleClick}
            variant="outline"
            className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800"
        >
            <MessageCircle className="mr-2 h-4 w-4" />
            {getButtonLabel(status)}
        </Button>
    )
}
