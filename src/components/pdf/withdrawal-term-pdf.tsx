'use client'

import { useState, useCallback } from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Image, Font } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { formatDateToLocal } from '@/lib/date-utils'

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

async function convertAllImages(urls: string[]): Promise<string[]> {
    const results = await Promise.all(urls.map(imageUrlToBase64))
    return results.filter((r): r is string => r !== null)
}

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
// Cores e Variáveis
// ==================================================
const primaryColor = '#059669' // Emerald 600
const primaryDark = '#047857' // Emerald 700
const textColor = '#1e293b' // Slate 800
const mutedColor = '#64748b' // Slate 500
const borderColor = '#e2e8f0' // Slate 200
const bgColor = '#f8fafc' // Slate 50

// ==================================================
// Estilos do PDF (Padrão WFIX Tech Emerald)
// ==================================================
const styles = StyleSheet.create({
    page: {
        padding: 40,
        paddingBottom: 150,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: textColor,
        backgroundColor: '#ffffff'
    },
    // Header
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
        fontSize: 14,
        fontWeight: 'bold',
        color: primaryColor,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    companyName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: textColor,
        marginBottom: 2,
    },
    companyInfo: {
        fontSize: 8,
        color: mutedColor,
        marginBottom: 2,
    },

    // Layout
    section: {
        marginBottom: 15,
    },
    grid2Col: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    col: {
        flex: 1,
    },

    // Box Title
    sectionHeader: {
        backgroundColor: bgColor,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderLeftWidth: 3,
        borderLeftColor: primaryColor,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: textColor,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Key-Value Row
    row: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'flex-start',
    },
    label: {
        width: '35%',
        fontSize: 9,
        fontWeight: 'bold',
        color: mutedColor,
    },
    value: {
        width: '65%',
        fontSize: 9,
        color: textColor,
    },

    // Checklist
    checklist: {
        marginTop: 5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    checkItem: {
        backgroundColor: '#ecfdf5', // Emerald 50
        padding: '4 8',
        borderRadius: 4,
        fontSize: 9,
        border: '1 solid #a7f3d0', // Emerald 200
        color: primaryDark,
    },

    // Photos
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
        gap: 10,
    },
    photoBox: {
        alignItems: 'center',
        width: '23%',
        marginBottom: 10
    },
    photo: {
        width: '100%',
        height: 70,
        objectFit: 'cover',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: borderColor,
    },
    photoLabel: {
        fontSize: 7,
        color: mutedColor,
        marginTop: 4,
    },

    // Legal Term Box
    legalTerm: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f8fafc',
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
    },
    legalText: {
        fontSize: 8,
        lineHeight: 1.4,
        textAlign: 'justify',
        color: textColor,
    },

    // Footer & Signature
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: primaryColor,
    },
    signatureBox: {
        flexDirection: 'row',
        backgroundColor: bgColor,
        padding: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: borderColor,
        marginBottom: 8,
    },
    signatureIcon: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderRightWidth: 1,
        borderRightColor: borderColor,
        paddingRight: 10
    },
    signatureTitle: {
        fontSize: 7,
        fontWeight: 'bold',
        color: primaryColor,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    signatureText: {
        fontSize: 6.5,
        color: mutedColor,
        fontFamily: 'Courier',
        marginBottom: 2,
    },
    footerDisclaimer: {
        fontSize: 6,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 6,
    }
})

interface CustodyData {
    orderDisplayId: string | number
    customerName: string
    customerDocument?: string
    equipmentType: string
    equipmentBrand: string
    equipmentModel: string
    equipmentSerial?: string
    accessories: string[]
    conditionNotes: string
    signatureUrl: string
    signedAt: string
    technicianName?: string
    integrityHash?: string
    geolocation?: { lat: number, lng: number }
    custodyIp?: string
    photos?: { label: string; url: string }[]
}

interface StoreSettings {
    trade_name: string
    legal_document?: string | null
    phone?: string | null
    logo_url?: string | null
    address?: {
        street?: string
        number?: string
        neighborhood?: string
        city?: string
        state?: string
    } | null
}

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

function formatAddress(address?: StoreSettings['address']): string {
    if (!address) return ''
    return [address.street, address.number, address.neighborhood, address.city, address.state].filter(Boolean).join(', ')
}

function WithdrawalTermDocument({ data, settings, integrityHash }: { data: CustodyData; settings: StoreSettings; integrityHash: string }) {
    const signedDate = formatDateToLocal(data.signedAt, 'dd/MM/yyyy HH:mm:ss')
    const osNumber = String(data.orderDisplayId).padStart(4, '0')

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoTextWfix}>WFIX </Text>
                        <Text style={styles.logoTextTech}>Tech</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.documentTitle}>Termo de Retirada</Text>
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

                {/* 2-Column Grid */}
                <View style={[styles.grid2Col, styles.section]}>
                    {/* OS / Client Column */}
                    <View style={styles.col}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Dados do Serviço</Text>
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
                            <Text style={styles.label}>Data da Coleta:</Text>
                            <Text style={styles.value}>{signedDate}</Text>
                        </View>
                    </View>

                    {/* Equipment Column */}
                    <View style={styles.col}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Equipamento</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Equipamento:</Text>
                            <Text style={styles.value}>{data.equipmentType} {data.equipmentBrand} {data.equipmentModel}</Text>
                        </View>
                        {data.equipmentSerial && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Nº Série:</Text>
                                <Text style={styles.value}>{data.equipmentSerial}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Acessórios */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Acessórios Coletados</Text>
                    </View>
                    {data.accessories && data.accessories.length > 0 ? (
                        <View style={styles.checklist}>
                            {data.accessories.map((item, idx) => (
                                <Text key={idx} style={styles.checkItem}>✓ {item}</Text>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ fontSize: 9, fontStyle: 'italic', color: mutedColor }}>Nenhum acessório coletado.</Text>
                    )}
                </View>

                {/* Condições */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Condições Físicas Reportadas</Text>
                    </View>
                    <Text style={{ fontSize: 9, lineHeight: 1.4, backgroundColor: '#fff', padding: 8, borderWidth: 1, borderColor: borderColor, borderRadius: 4 }}>
                        {data.conditionNotes || 'Sem avarias visíveis relatadas no momento da coleta.'}
                    </Text>
                </View>

                {/* Photos */}
                {data.photos && data.photos.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Registro Fotográfico (Check-in)</Text>
                        </View>
                        <View style={styles.photosContainer}>
                            {data.photos.slice(0, 4).map((photo, idx) => (
                                <View key={idx} style={styles.photoBox}>
                                    {photo.url ? (
                                        <Image style={styles.photo} src={photo.url} />
                                    ) : null}
                                    <Text style={styles.photoLabel}>{photo.label}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={{ fontSize: 7, color: mutedColor, fontStyle: 'italic', marginTop: 4 }}>
                            * As fotografias completas em alta resolução encontram-se disponíveis no portal do cliente através do link de acompanhamento desta Ordem de Serviço.
                        </Text>
                    </View>
                )}

                {/* Termo Legal */}
                <View style={styles.legalTerm}>
                    <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>DECLARAÇÃO DE ENTREGA EXCLUSIVA</Text>
                    <Text style={styles.legalText}>
                        1. Declaro ser o proprietário ou responsável legal pelo equipamento acima descrito.
                        {"\n"}
                        2. Autorizo a {settings.trade_name} a transportar o equipamento para suas dependências para fins de análise técnica e orçamento.
                        {"\n"}
                        3. Confirmo que a lista de acessórios e as condições físicas relatadas conferem com a realidade do aparelho no momento da entrega.
                        {"\n"}
                        4. Estou ciente de que a análise técnica pode exigir a desmontagem do equipamento e que, em aparelhos que entram \"sem ligar\", não nos responsabilizamos por defeitos ocultos pré-existentes que só venham a ser detectados após o restabelecimento da energia.
                        {"\n"}
                        5. Havendo novos defeitos identificados nestas condições, um orçamento complementar será enviado para aprovação antes de qualquer reparo adicional.
                    </Text>
                </View>

                {/* Footer Fixado (Absolute) */}
                <View style={styles.footer}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureIcon}>
                            <Text style={{ fontSize: 24, color: primaryColor }}>☑</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.signatureTitle}>Assinatura Eletrônica Qualificada</Text>
                            <Text style={styles.signatureText}>
                                Assinado por {data.customerName} em {signedDate}
                            </Text>
                            <Text style={styles.signatureText}>
                                IP Validador: {maskIp(data.custodyIp)} | Auth Method: Click-Wrap Agreement
                            </Text>
                            <Text style={styles.signatureText}>
                                SHA-256 Hash: {integrityHash}
                            </Text>
                            {data.geolocation && (
                                <Text style={styles.signatureText}>
                                    Geo: {data.geolocation.lat.toFixed(6)}, {data.geolocation.lng.toFixed(6)}
                                </Text>
                            )}
                        </View>
                    </View>

                    <Text style={styles.footerDisclaimer}>
                        Documento regido e válido conforme MP 2.200-2/2001 e Lei 14.063/2020 para Assinatura Eletrônica.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

// --- Button Component ---

interface WithdrawalTermButtonProps {
    data: CustodyData
    settings: StoreSettings
    className?: string
}

export default function WithdrawalTermButton({ data, settings, className }: WithdrawalTermButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const osNumber = String(data.orderDisplayId).padStart(4, '0')
    const storeName = settings.trade_name.replace(/\s+/g, '_').toUpperCase()
    const fileName = `${storeName}_OS_${osNumber}_Retirada.pdf`

    const handleDownload = useCallback(async () => {
        setIsGenerating(true)
        try {
            // Gerar SHA-256 com dados sensíveis de custódia
            const hashInput = `${data.orderDisplayId}|${data.signedAt}|${data.custodyIp || 'N/A'}`
            const integrityHash = await generateSHA256(hashInput)

            // Pré-converter todas as fotos para base64
            let convertedPhotos = data.photos
            if (data.photos && data.photos.length > 0) {
                const urls = data.photos.map(p => p.url)
                const base64Urls = await convertAllImages(urls)
                convertedPhotos = data.photos.map((p, i) => ({
                    ...p,
                    url: base64Urls[i] || p.url // fallback to original if conversion fails
                }))
            }

            // Converter logo se for URL externa
            let logoBase64: string | undefined
            if (settings.logo_url?.startsWith('http')) {
                logoBase64 = (await imageUrlToBase64(settings.logo_url)) || undefined
            }

            // Clones com imagens base64
            const dataWithBase64: CustodyData = {
                ...data,
                photos: convertedPhotos
            }

            const settingsWithBase64: StoreSettings = {
                ...settings,
                logo_url: logoBase64 || settings.logo_url,
            }

            // Gerar o PDF blob
            const blob = await pdf(
                <WithdrawalTermDocument data={dataWithBase64} settings={settingsWithBase64} integrityHash={integrityHash} />
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
    }, [data, settings, fileName])

    return (
        <Button
            variant="outline"
            disabled={isGenerating}
            onClick={handleDownload}
            className={`w-full ${className || ''}`}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Gerando PDF...
                </>
            ) : (
                <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Baixar Termo de Retirada
                </>
            )}
        </Button>
    )
}
