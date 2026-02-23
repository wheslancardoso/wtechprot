'use client'

import { useState, useCallback } from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { formatDateToLocal } from '@/lib/date-utils'

// ==================================================
// SHA-256 Hash via Web Crypto API
// ==================================================
async function generateSHA256(input: string): Promise<string> {
    try {
        const encoder = new TextEncoder()
        const data = encoder.encode(input)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    } catch {
        // Fallback simples caso crypto.subtle não esteja disponível
        let hash = 0
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return 'FALLBACK-' + Math.abs(hash).toString(16).toUpperCase().padStart(16, '0')
    }
}

// ==================================================
// Utilidade: Converter URL de imagem para base64 JPEG data URI
// react-pdf NÃO suporta WebP, então re-codificamos via canvas
// ==================================================
async function imageUrlToBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url)
        if (!response.ok) return null
        const blob = await response.blob()

        return new Promise((resolve) => {
            const img = new window.Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                const ctx = canvas.getContext('2d')
                if (!ctx) { resolve(null); return }
                ctx.drawImage(img, 0, 0)
                const jpegDataUri = canvas.toDataURL('image/jpeg', 0.85)
                resolve(jpegDataUri)
            }
            img.onerror = () => resolve(null)
            img.src = URL.createObjectURL(blob)
        })
    } catch {
        console.error('Erro ao converter imagem para base64:', url)
        return null
    }
}

// ==================================================
// Cores e Variáveis
// ==================================================
const primaryColor = '#059669' // Emerald 600
const primaryDark = '#047857' // Emerald 700
const textColor = '#1e293b' // Slate 800
const mutedColor = '#64748b' // Slate 500
const borderColor = '#e2e8f0' // Slate 200
const bgColor = '#f8fafc' // Slate 50

// ==================================================
// Estilos do PDF
// ==================================================
const styles = StyleSheet.create({
    page: {
        padding: 40,
        paddingBottom: 140,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: textColor,
        backgroundColor: '#ffffff'
    },

    // ── Header ──
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: primaryColor,
        paddingBottom: 15,
        marginBottom: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoTextWfix: {
        fontSize: 24,
        fontWeight: 'bold',
        color: primaryColor,
    },
    logoTextTech: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    documentTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: primaryColor,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    companyInfo: {
        fontSize: 7.5,
        color: mutedColor,
        marginBottom: 1,
    },

    // ── Layout ──
    section: {
        marginBottom: 14,
    },
    grid2Col: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    col: {
        flex: 1,
    },

    // ── Section Headers ──
    sectionHeader: {
        backgroundColor: bgColor,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderLeftWidth: 3,
        borderLeftColor: primaryColor,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: textColor,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionNumber: {
        fontSize: 9,
        fontWeight: 'bold',
        color: primaryColor,
        marginRight: 4,
    },

    // ── Key-Value Row ──
    row: {
        flexDirection: 'row',
        marginBottom: 3,
        alignItems: 'flex-start',
    },
    label: {
        width: '35%',
        fontSize: 8,
        fontWeight: 'bold',
        color: mutedColor,
    },
    value: {
        width: '65%',
        fontSize: 8.5,
        color: textColor,
    },

    // ── Service Description Box ──
    serviceBox: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: borderColor,
        padding: 10,
        marginBottom: 10,
    },
    serviceText: {
        fontSize: 9,
        lineHeight: 1.4,
        color: textColor,
        marginBottom: 10,
    },
    costContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: borderColor,
        paddingTop: 8,
    },
    costLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: mutedColor,
        textTransform: 'uppercase',
        marginRight: 10,
    },
    costValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: primaryColor,
    },

    // ── Bonus section ──
    bonusSection: {
        backgroundColor: '#ecfdf5',
        borderWidth: 1,
        borderColor: '#a7f3d0',
        padding: 10,
        marginBottom: 14,
    },
    bonusTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: primaryDark,
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    bonusText: {
        fontSize: 7.5,
        color: '#064e3b',
        lineHeight: 1.3,
    },
    bonusDetailsContainer: {
        flexDirection: 'row',
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#d1fae5',
        gap: 15,
    },

    // ── Table ──
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: borderColor,
        overflow: 'hidden',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: bgColor,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
    },
    tableHeaderCell: {
        fontSize: 7.5,
        fontWeight: 'bold',
        color: mutedColor,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    tableCell: {
        fontSize: 8.5,
        color: textColor,
    },
    col1: { flex: 3 },
    col2: { flex: 1, textAlign: 'right' },

    // ── Warning Box ──
    warningBox: {
        backgroundColor: '#fffbeb',
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
        padding: 8,
        marginTop: 6,
    },
    warningText: {
        fontSize: 7,
        color: '#b45309',
        lineHeight: 1.3,
        textAlign: 'justify',
    },

    // ── Termos e Condições ──
    clauseContainer: {
        marginBottom: 6,
    },
    clauseTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: textColor,
        marginBottom: 2,
    },
    clauseText: {
        fontSize: 7.5,
        color: '#475569',
        lineHeight: 1.35,
        textAlign: 'justify',
    },
    clauseDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: 6,
    },

    // ── Footer ──
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        paddingTop: 8,
        borderTopWidth: 2,
        borderTopColor: primaryColor,
    },
    signatureBox: {
        flexDirection: 'row',
        backgroundColor: bgColor,
        padding: 8,
        borderWidth: 1,
        borderColor: borderColor,
        marginBottom: 6,
    },
    signatureIcon: {
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        borderRightWidth: 1,
        borderRightColor: borderColor,
        paddingRight: 8,
    },
    signatureTitle: {
        fontSize: 7,
        fontWeight: 'bold',
        color: primaryColor,
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    signatureText: {
        fontSize: 6,
        color: mutedColor,
        fontFamily: 'Courier',
        marginBottom: 1,
    },
    legalText: {
        fontSize: 5.5,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 4,
    }
})

// ==================================================
// Tipo de dados da Loja (Settings)
// ==================================================
interface StoreSettings {
    trade_name: string
    legal_document?: string | null
    phone?: string | null
    logo_url?: string | null
    warranty_days_labor?: number
    address?: {
        street?: string
        number?: string
        neighborhood?: string
        city?: string
        state?: string
        zip?: string
    } | null
}

// ==================================================
// Tipo de dados da OS
// ==================================================
interface OrderData {
    orderId?: string // UUID para SHA-256
    displayId: string | number
    checkout_checklist?: Record<string, boolean> | null
    customerName: string
    customerPhone: string
    customerDocument?: string | null // CPF/CNPJ
    equipmentType: string
    equipmentBrand: string
    equipmentModel: string
    equipmentSerial?: string | null // Nº Serial
    diagnosisText: string
    laborCost: number
    photosCheckin?: string[]
    photosCheckout: string[] | { url: string; label?: string }[]
    custodyPhotos?: { url: string; label?: string }[]
    finishedAt: string
    externalParts: Array<{ name: string; price?: number }>
    signatureEvidence?: {
        ip_address?: string
        accepted_at: string
        device_fingerprint?: string
        terms_version?: string
        method?: string
        integrity_hash?: string
    } | null
    custodyEvidence?: {
        custody_signed_at?: string
        custody_ip?: string
        custody_signature_url?: string
        custody_integrity_hash?: string
    } | null
}

// ==================================================
// Auxiliares
// ==================================================
function maskIp(ip?: string) {
    if (!ip) return 'N/A'
    const clean = ip.replace('::ffff:', '')
    if (clean.includes('.')) {
        const parts = clean.split('.')
        if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`
    }
    if (clean.length > 8) return `${clean.substring(0, Math.floor(clean.length / 2))}***`
    return '***'
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatAddress(address?: StoreSettings['address']): string {
    if (!address) return ''
    return [address.street, address.number, address.neighborhood, address.city, address.state].filter(Boolean).join(', ')
}

function maskDocument(doc?: string | null): string {
    if (!doc) return 'Não informado'
    const clean = doc.replace(/\D/g, '')
    if (clean.length === 11) return `${clean.substring(0, 3)}.***.***.${clean.substring(9, 11)}`
    if (clean.length === 14) return `${clean.substring(0, 2)}.***.***/****-${clean.substring(12, 14)}`
    return doc
}

// ==================================================
// Componente PDF — Certificado de Garantia
// ==================================================
function WarrantyDocument({ data, settings, integrityHash }: { data: OrderData; settings: StoreSettings; integrityHash: string }) {
    const osNumber = String(data.displayId).padStart(4, '0')
    const finishedDate = formatDateToLocal(data.finishedAt, 'dd/MM/yyyy')
    const warrantyDays = settings.warranty_days_labor || 180
    const warrantyDaysText = warrantyDays === 180 ? 'cento e oitenta' : warrantyDays === 90 ? 'noventa' : String(warrantyDays)

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* ── HEADER ── */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoTextWfix}>WFIX </Text>
                        <Text style={styles.logoTextTech}>Tech</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.documentTitle}>Certificado de Garantia</Text>
                        {settings.legal_document && (
                            <Text style={styles.companyInfo}>CNPJ/CPF: {settings.legal_document}</Text>
                        )}
                        {settings.phone && (
                            <Text style={styles.companyInfo}>Tel: {settings.phone}</Text>
                        )}
                        {settings.address && (
                            <Text style={styles.companyInfo}>{formatAddress(settings.address)}</Text>
                        )}
                    </View>
                </View>

                {/* ── §1 IDENTIFICAÇÃO ── */}
                <View style={[styles.grid2Col, styles.section]}>
                    <View style={styles.col}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                <Text style={styles.sectionNumber}>§1</Text> Identificação
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>OS Nº:</Text>
                            <Text style={[styles.value, { fontWeight: 'bold' }]}>#{osNumber}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Cliente:</Text>
                            <Text style={styles.value}>{data.customerName}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>CPF/CNPJ:</Text>
                            <Text style={styles.value}>{maskDocument(data.customerDocument)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Telefone:</Text>
                            <Text style={styles.value}>{data.customerPhone}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Data Entrega:</Text>
                            <Text style={styles.value}>{finishedDate}</Text>
                        </View>
                    </View>
                    <View style={styles.col}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Equipamento</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Tipo:</Text>
                            <Text style={styles.value}>{data.equipmentType}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Marca:</Text>
                            <Text style={styles.value}>{data.equipmentBrand}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Modelo:</Text>
                            <Text style={styles.value}>{data.equipmentModel}</Text>
                        </View>
                        {data.equipmentSerial && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Nº Série:</Text>
                                <Text style={[styles.value, { fontFamily: 'Courier', fontSize: 8 }]}>{data.equipmentSerial}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── §2 SERVIÇO EXECUTADO ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            <Text style={styles.sectionNumber}>§2</Text> Serviço Executado
                        </Text>
                    </View>
                    <View style={styles.serviceBox}>
                        <Text style={styles.serviceText}>
                            {data.diagnosisText || 'Manutenção técnica realizada conforme diagnóstico preliminar.'}
                        </Text>
                        <View style={styles.costContainer}>
                            <Text style={styles.costLabel}>Total Mão de Obra</Text>
                            <Text style={styles.costValue}>{formatCurrency(data.laborCost)}</Text>
                        </View>
                    </View>
                </View>

                {/* ── §3 PEÇAS EXTERNAS (Compra Assistida) ── */}
                {data.externalParts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                <Text style={styles.sectionNumber}>§3</Text> Peças — Compra Assistida
                            </Text>
                        </View>
                        <View style={styles.table}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableHeaderCell, styles.col1]}>Item Incorporado</Text>
                                <Text style={[styles.tableHeaderCell, styles.col2]}>Valor Aprox.</Text>
                            </View>
                            {data.externalParts.map((part, index) => (
                                <View key={index} style={[styles.tableRow, index === data.externalParts.length - 1 ? styles.tableRowLast : {}]}>
                                    <Text style={[styles.tableCell, styles.col1]}>{part.name}</Text>
                                    <Text style={[styles.tableCell, styles.col2]}>{part.price ? formatCurrency(part.price) : '—'}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>
                                As peças listadas foram adquiridas em regime de Compra Assistida (fornecimento de terceiros). A garantia destas peças recai diretamente sobre a distribuidora/fabricante original, conforme §5 (IV) deste certificado.
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── BÔNUS: SUPORTE REMOTO ── */}
                <View style={styles.bonusSection}>
                    <Text style={styles.bonusTitle}>Bônus Exclusivo: Suporte Pós-Serviço</Text>
                    <Text style={styles.bonusText}>
                        Como cortesia, esta OS concede 02 (dois) Tickets de Suporte Técnico (Acesso Remoto ou WhatsApp) para orientações, dúvidas de uso e ajustes finos pertinentes ao serviço executado. Este benefício não se confunde com a garantia técnica descrita no §5.
                    </Text>
                    <View style={styles.bonusDetailsContainer}>
                        <Text style={{ fontSize: 7, color: '#065f46' }}>
                            <Text style={{ fontWeight: 'bold' }}>Validade:</Text> 30 dias após entrega.
                        </Text>
                        <Text style={{ fontSize: 7, color: '#065f46' }}>
                            <Text style={{ fontWeight: 'bold' }}>Regra:</Text> Cada ticket = 1 atendimento de até 30min.
                        </Text>
                    </View>
                </View>

                {/* ── §5 TERMOS E CONDIÇÕES DA GARANTIA ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            <Text style={styles.sectionNumber}>§5</Text> Termos e Condições da Garantia
                        </Text>
                    </View>

                    {/* I — Escopo */}
                    <View style={styles.clauseContainer}>
                        <Text style={styles.clauseTitle}>I — Escopo da Garantia</Text>
                        <Text style={styles.clauseText}>
                            A {settings.trade_name.toUpperCase()} assegura o prazo de {warrantyDays} ({warrantyDaysText}) dias de garantia, única e exclusivamente para o serviço (mão de obra) executado nesta Ordem de Serviço, a contar da data de entrega acima indicada.
                        </Text>
                    </View>
                    <View style={styles.clauseDivider} />

                    {/* II — Software */}
                    <View style={styles.clauseContainer}>
                        <Text style={styles.clauseTitle}>II — Garantia de Software</Text>
                        <Text style={styles.clauseText}>
                            Serviços relacionados a software (formatação, instalação de sistema operacional, remoção de vírus, configurações e ajustes de sistema) possuem garantia de retrabalho limitada a 15 (quinze) dias. Esta cláusula não abrange suporte ao uso (coberto pelo bônus acima, quando aplicável), mas sim a correção gratuita de falhas diretamente atribuíveis ao serviço original.
                        </Text>
                    </View>
                    <View style={styles.clauseDivider} />

                    {/* III — Exclusões */}
                    <View style={styles.clauseContainer}>
                        <Text style={styles.clauseTitle}>III — Exclusões e Perda de Garantia</Text>
                        <Text style={styles.clauseText}>
                            A garantia será imediatamente invalidada nos seguintes casos: (a) Rompimento, adulteração ou remoção dos lacres de segurança aplicados pela {settings.trade_name.toUpperCase()}; (b) Intervenção técnica realizada por terceiros não autorizados; (c) Danos causados por mau uso, quedas, exposição a líquidos, descargas elétricas ou variações de tensão na rede; (d) Instalação de software não autorizado ou modificações no sistema operacional que comprometam o serviço realizado.
                        </Text>
                    </View>
                    <View style={styles.clauseDivider} />

                    {/* IV — Peças */}
                    <View style={styles.clauseContainer}>
                        <Text style={styles.clauseTitle}>IV — Peças de Terceiros (Compra Assistida)</Text>
                        <Text style={styles.clauseText}>
                            Peças adquiridas pelo cliente ou fornecidas por distribuidores externos à {settings.trade_name.toUpperCase()} possuem garantia própria do fabricante/vendedor original. A responsabilidade desta assistência limita-se exclusivamente à mão de obra de instalação, não abrangendo defeitos de fabricação, compatibilidade ou vida útil dos componentes.
                        </Text>
                    </View>
                </View>

                {/* ── FOOTER — Dossiê de Assinatura ── */}
                <View style={styles.footer}>
                    {data.signatureEvidence && (
                        <View style={styles.signatureBox}>
                            <View style={styles.signatureIcon}>
                                <Text style={{ fontSize: 22, color: primaryColor }}>☑</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.signatureTitle}>Assinatura Digital</Text>
                                <Text style={styles.signatureText}>
                                    Assinado por {data.customerName} em {formatDateToLocal(data.signatureEvidence.accepted_at, 'dd/MM/yyyy às HH:mm:ss')}
                                </Text>
                                <Text style={styles.signatureText}>
                                    IP Validador: {maskIp(data.signatureEvidence.ip_address)} | Auth Method: OTP Secure
                                </Text>
                                <Text style={styles.signatureText}>
                                    SHA-256: {integrityHash.substring(0, 16)}...{integrityHash.substring(integrityHash.length - 16)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {!data.signatureEvidence && (
                        <View style={styles.signatureBox}>
                            <View style={styles.signatureIcon}>
                                <Text style={{ fontSize: 22, color: mutedColor }}>☐</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.signatureTitle}>Verificação de Autenticidade</Text>
                                <Text style={styles.signatureText}>
                                    ID de Autenticidade (SHA-256): {integrityHash.substring(0, 16)}...{integrityHash.substring(integrityHash.length - 16)}
                                </Text>
                                <Text style={styles.signatureText}>
                                    Emitido em: {formatDateToLocal(data.finishedAt, 'dd/MM/yyyy às HH:mm:ss')}
                                </Text>
                            </View>
                        </View>
                    )}

                    <Text style={styles.legalText}>
                        Documento regido e válido conforme MP 2.200-2/2001 e Lei 14.063/2020 para Assinatura Eletrônica. Hash completo disponível mediante solicitação.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

// ==================================================
// Botão de Download
// ==================================================
interface WarrantyPdfButtonProps {
    orderData: OrderData
    storeSettings: StoreSettings
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    icon?: React.ReactNode
}

export default function WarrantyPdfButton({ orderData, storeSettings, className, variant = "outline", icon }: WarrantyPdfButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const osNumber = String(orderData.displayId).padStart(4, '0')
    const storeName = storeSettings.trade_name.replace(/\s+/g, '_').toUpperCase()
    const fileName = `${storeName}_OS_${osNumber}_Garantia.pdf`

    const handleDownload = useCallback(async () => {
        setIsGenerating(true)
        try {
            // Gerar SHA-256 com dados sensíveis
            const hashInput = `${orderData.orderId || orderData.displayId}|${orderData.finishedAt}|${orderData.customerDocument || 'N/A'}`
            const integrityHash = await generateSHA256(hashInput)

            // Converter logo se for URL externa
            let logoBase64: string | undefined
            if (storeSettings.logo_url?.startsWith('http')) {
                logoBase64 = (await imageUrlToBase64(storeSettings.logo_url)) || undefined
            }

            const settingsWithBase64: StoreSettings = {
                ...storeSettings,
                logo_url: logoBase64 || storeSettings.logo_url,
            }

            // Gerar o PDF blob
            const blob = await pdf(
                <WarrantyDocument data={orderData} settings={settingsWithBase64} integrityHash={integrityHash} />
            ).toBlob()

            // Trigger download
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Erro ao gerar PDF:', error)
        } finally {
            setIsGenerating(false)
        }
    }, [orderData, storeSettings, fileName])

    return (
        <Button
            variant={variant}
            disabled={isGenerating}
            onClick={handleDownload}
            className={`w-full ${icon ? 'p-0 h-full bg-transparent hover:bg-transparent' : ''} ${className || ''}`}
        >
            {isGenerating ? (
                <>
                    <Loader2 className={`animate-spin ${icon ? 'h-4 w-4' : 'mr-2 h-4 w-4'}`} />
                    {!icon && "Gerando PDF..."}
                </>
            ) : (
                <>
                    {icon ? icon : <FileDown className="mr-2 h-4 w-4" />}
                    {!icon && "Baixar Certificado de Garantia"}
                </>
            )}
        </Button>
    )
}
export type { OrderData, StoreSettings }
