'use client'

import {
    Laptop,
    Monitor,
    Smartphone,
    Tablet,
    Printer,
    Gamepad2,
    Server,
    Cpu,
    MonitorSmartphone,
    type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'

// ==================================================
// Mapeamento tipo → ícone Lucide
// ==================================================
const typeIconMap: Record<string, LucideIcon> = {
    // Notebooks / Laptops
    notebook: Laptop,
    laptop: Laptop,
    macbook: Laptop,
    chromebook: Laptop,

    // Desktops / PCs
    desktop: Monitor,
    pc: Monitor,
    computador: Monitor,
    'computador desktop': Monitor,
    workstation: Monitor,

    // All-in-One
    'all-in-one': MonitorSmartphone,
    'all in one': MonitorSmartphone,
    aio: MonitorSmartphone,
    imac: MonitorSmartphone,

    // Celulares / Smartphones
    celular: Smartphone,
    smartphone: Smartphone,
    iphone: Smartphone,
    telefone: Smartphone,

    // Tablets
    tablet: Tablet,
    ipad: Tablet,

    // Impressoras
    impressora: Printer,
    printer: Printer,
    multifuncional: Printer,

    // Consoles
    console: Gamepad2,
    videogame: Gamepad2,
    playstation: Gamepad2,
    xbox: Gamepad2,
    nintendo: Gamepad2,

    // Servidores
    servidor: Server,
    server: Server,
    nas: Server,
}

/**
 * Retorna o ícone Lucide correspondente ao tipo de equipamento.
 * Faz matching case-insensitive e parcial (ex: "Notebook Gamer" → Laptop).
 */
function getIconForType(type?: string | null): LucideIcon {
    if (!type) return Cpu

    const normalized = type.toLowerCase().trim()

    // Match exato primeiro
    if (typeIconMap[normalized]) return typeIconMap[normalized]

    // Match parcial (o tipo pode conter a chave, ex: "Notebook Gamer")
    for (const [key, icon] of Object.entries(typeIconMap)) {
        if (normalized.includes(key)) return icon
    }

    return Cpu
}

// ==================================================
// Props
// ==================================================
interface EquipmentIconProps {
    type?: string | null
    photoUrl?: string | null
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizeConfig = {
    sm: { container: 'w-10 h-10', icon: 'h-5 w-5', image: 40 },
    md: { container: 'w-16 h-16', icon: 'h-8 w-8', image: 64 },
    lg: { container: 'w-24 h-24', icon: 'h-12 w-12', image: 96 },
}

// ==================================================
// Componente
// ==================================================
export default function EquipmentIcon({ type, photoUrl, size = 'md', className = '' }: EquipmentIconProps) {
    const config = sizeConfig[size]

    // Se tem foto, mostra a foto em círculo
    if (photoUrl) {
        return (
            <div className={`inline-flex items-center justify-center ${config.container} rounded-full overflow-hidden border-2 border-background shadow-sm ${className}`}>
                <Image
                    src={photoUrl}
                    alt={type || 'Equipamento'}
                    width={config.image}
                    height={config.image}
                    className="w-full h-full object-cover"
                />
            </div>
        )
    }

    // Senão, mostra o ícone mapeado
    const Icon = getIconForType(type)
    return (
        <div className={`inline-flex items-center justify-center ${config.container} bg-muted rounded-full border-2 border-background shadow-sm ${className}`}>
            <Icon className={`${config.icon} text-muted-foreground`} />
        </div>
    )
}

// Export auxiliar para uso externo
export { getIconForType }
