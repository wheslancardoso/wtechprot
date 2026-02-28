import type { TenantSettings } from '@/app/dashboard/settings/actions'

// ==================================================
// Tipos
// ==================================================
interface OrderInfo {
    displayId: number
    customerName: string
    customerPhone: string
    laborCost: number
    status: string
    externalParts?: Array<{
        name: string
        url?: string
        price?: number
    }>
}

// ==================================================
// Formatar moeda
// ==================================================
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

// ==================================================
// Gerar Link do WhatsApp
// ==================================================
export function generateWhatsAppLink(phone: string, message: string): string {
    // Limpar telefone (apenas números)
    const cleanPhone = phone.replace(/\D/g, '')

    // Adicionar código do país se necessário
    const phoneWithCountry = cleanPhone.startsWith('55')
        ? cleanPhone
        : `55${cleanPhone}`

    // Encode da mensagem
    const encodedMessage = encodeURIComponent(message)

    return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodedMessage}`
}

// ==================================================
// Template: Diagnóstico Concluído (Curadoria)
// ==================================================
export function templateDiagnosticoConcluido(
    order: OrderInfo,
    settings: TenantSettings
): string {
    const osNumber = String(order.displayId).padStart(4, '0')
    const firstName = order.customerName.split(' ')[0]

    let message = `Olá ${firstName}! 👋\n\n`
    message += `Aqui é da *${settings.trade_name}*.\n\n`
    message += `O diagnóstico da OS #${osNumber} foi concluído!\n\n`

    // Se tem peças externas
    if (order.externalParts && order.externalParts.length > 0) {
        message += `📦 *Peças necessárias:*\n`
        order.externalParts.forEach((part, index) => {
            message += `${index + 1}. ${part.name}`
            if (part.price) {
                message += ` - ~${formatCurrency(part.price)}~`
            }
            message += '\n'
            if (part.url) {
                message += `   🔗 ${part.url}\n`
            }
        })
        message += `\n`
        message += `💡 *Importante:* Adquira a peça no link acima e mande entregar aqui na loja, ou traga pessoalmente.\n\n`
    }

    message += `🔧 Mão de obra: ${formatCurrency(order.laborCost)}\n\n`
    message += `Dúvidas? Responda esta mensagem!`

    return message
}

// ==================================================
// Template: Aguardando Aprovação
// ==================================================
export function templateAguardandoAprovacao(
    order: OrderInfo,
    settings: TenantSettings
): string {
    const osNumber = String(order.displayId).padStart(4, '0')
    const firstName = order.customerName.split(' ')[0]

    let message = `Olá ${firstName}! 👋\n\n`
    message += `Aqui é da *${settings.trade_name}*.\n\n`
    message += `O orçamento da OS #${osNumber} está pronto para sua aprovação.\n\n`
    message += `💰 *Valor total:* ${formatCurrency(order.laborCost)}\n\n`
    message += `Para aprovar, responda com *SIM* ou acesse nosso sistema.\n\n`
    message += `Prazo estimado: 24-48h após aprovação.`

    return message
}

// ==================================================
// Template: Pronto para Retirada
// ==================================================
export function templateProntoRetirada(
    order: OrderInfo,
    settings: TenantSettings
): string {
    const osNumber = String(order.displayId).padStart(4, '0')
    const firstName = order.customerName.split(' ')[0]

    let message = `Olá ${firstName}! 🎉\n\n`
    message += `Seu aparelho está *PRONTO*!\n\n`
    message += `📋 OS: #${osNumber}\n`
    message += `💰 Valor: ${formatCurrency(order.laborCost)}\n`
    message += `🛡️ Garantia: ${settings.warranty_days_labor || 180} dias sobre a mão de obra\n\n`

    // Chave Pix
    if (settings.pix_key) {
        message += `⚡ *Chave Pix para agilizar:*\n`
        message += `${settings.pix_key}\n`
        message += `(${settings.pix_key_type?.toUpperCase() || 'CHAVE'})\n\n`
    }

    // Endereço
    if (settings.address?.street) {
        message += `📍 *Nosso endereço:*\n`
        message += `${settings.address.street}`
        if (settings.address.number) message += `, ${settings.address.number}`
        if (settings.address.neighborhood) message += ` - ${settings.address.neighborhood}`
        if (settings.address.city) message += `\n${settings.address.city}`
        if (settings.address.state) message += `/${settings.address.state}`
        message += '\n\n'
    }

    message += `Aguardamos você! 😊`

    return message
}

// ==================================================
// Template: Lembrete de Peça Pendente
// ==================================================
export function templateLembretePeca(
    order: OrderInfo,
    settings: TenantSettings
): string {
    const osNumber = String(order.displayId).padStart(4, '0')
    const firstName = order.customerName.split(' ')[0]

    let message = `Olá ${firstName}! 👋\n\n`
    message += `Aqui é da *${settings.trade_name}*.\n\n`
    message += `📦 Passando para lembrar sobre a OS #${osNumber}.\n\n`
    message += `Estamos aguardando a chegada da peça para continuar o reparo.\n\n`
    message += `A peça já chegou? Traga para a loja e daremos prioridade!`

    return message
}

// ==================================================
// Obter Template por Status
// ==================================================
export function getTemplateByStatus(
    order: OrderInfo,
    settings: TenantSettings
): { message: string; label: string } {
    switch (order.status) {
        case 'waiting_approval':
            return {
                message: templateAguardandoAprovacao(order, settings),
                label: 'Enviar Orçamento',
            }
        case 'waiting_parts':
            if (order.externalParts && order.externalParts.length > 0) {
                return {
                    message: templateDiagnosticoConcluido(order, settings),
                    label: 'Enviar Link da Peça',
                }
            }
            return {
                message: templateLembretePeca(order, settings),
                label: 'Lembrar sobre Peça',
            }
        case 'ready':
        case 'finished':
            return {
                message: templateProntoRetirada(order, settings),
                label: 'Avisar Retirada',
            }
        default:
            return {
                message: templateDiagnosticoConcluido(order, settings),
                label: 'Enviar WhatsApp',
            }
    }
}

// ==================================================
// Template: Passo 1 - A Entrega e a Blindagem (Hoje)
// ==================================================
export function templatePosVendaPasso1(
    customerName: string,
    displayId: number,
    settings: TenantSettings
): string {
    const osNumber = String(displayId).padStart(4, '0')
    const firstName = customerName.split(' ')[0]
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seu-sistema.com'
    const trackingLink = `${baseUrl}/os/${osNumber}`

    return `Serviço finalizado com sucesso, ${firstName}! A máquina já está pronta para uso e testada. 🚀\n\nPara a sua segurança, estou te enviando o link do meu Sistema WFIX: ${trackingLink}\nLá você tem acesso aos detalhes do Serviço e do Orçamento, que funciona como a sua Garantia Oficial de 6 meses.\n\n⚠️ *Aviso importante sobre a garantia:* Ela cobre 100% de qualquer falha no meu serviço ou na peça instalada. Porém, ela não se aplica em casos de mau uso (vírus, quedas, líquidos derramados ou desconfiguração pelo usuário).\n\nQualquer dúvida de uso, estou à disposição!`
}

// ==================================================
// Template: Passo 2 - A Prova Social (24 a 48 horas depois)
// ==================================================
export function templatePosVendaPasso2(
    customerName: string
): string {
    const firstName = customerName.split(' ')[0]
    const googleLink = '[SEU LINK DO GOOGLE]'

    return `Olá, ${firstName}! Passando para confirmar se a máquina está funcionando perfeitamente hoje. Tudo certo por aí?\n\nAproveitando: espero que tenha gostado do meu atendimento! Se puder me dar uma força, deixa uma avaliação rápida lá no meu perfil do Google, me ajuda bastante: ${googleLink} ⭐`
}

// ==================================================
// Template: Passo 3 - O Check-up de Autoridade (30 dias depois)
// ==================================================
export function templatePosVendaPasso3(
    customerName: string
): string {
    const firstName = customerName.split(' ')[0]

    return `Bom dia, ${firstName}! Tudo bem? Como parte do meu protocolo de atendimento, faço esse acompanhamento de 30 dias após o serviço. O computador continua operando com o desempenho ideal?`
}

// ==================================================
// Template: Passo 4 - A Nova Venda (5º ou 6º Mês)
// ==================================================
export function templatePosVendaPasso4(
    customerName: string,
    warrantyEndDate: string | Date
): string {
    const firstName = customerName.split(' ')[0]
    let formattedDate = '[DATA]'
    if (warrantyEndDate) {
        formattedDate = new Date(warrantyEndDate).toLocaleDateString('pt-BR')
    }

    return `Bom dia, ${firstName}! Tudo bem? Verifiquei aqui no sistema que a garantia da sua máquina encerra no dia ${formattedDate}. Como padrão do meu atendimento, faço essa checagem final. Está tudo certo com o funcionamento da máquina?`
}
