'use client'

import { useState, useCallback } from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { formatDateToLocal } from '@/lib/date-utils'
import type { OrderData, StoreSettings } from '@/components/pdf/warranty-pdf'
import type { TechnicalReport } from '@/types/technical-report'

// ==================================================
// Estilos do PDF (Reutilizando base do WarrantyPdf)
// ==================================================
const styles = StyleSheet.create({
    page: {
        padding: 40,
        paddingBottom: 80,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    headerWithLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: '2 solid #333',
        paddingBottom: 10,
    },
    header: {
        marginBottom: 20,
        borderBottom: '2 solid #333',
        paddingBottom: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoTextWfix: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#059669',
    },
    logoTextTech: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    companyInfo: {
        flex: 1,
        textAlign: 'right',
    },
    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    companyDetail: {
        fontSize: 8,
        color: '#666',
        marginTop: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        color: '#666',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        backgroundColor: '#f0f0f0',
        padding: 5,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: '35%',
        fontWeight: 'bold',
    },
    value: {
        width: '65%',
    },
    textBlock: {
        fontSize: 10,
        lineHeight: 1.5,
        textAlign: 'justify',
        marginBottom: 5,
    },
    testItem: {
        flexDirection: 'row',
        marginBottom: 3,
        paddingLeft: 10,
    },
    bullet: {
        width: 10,
        fontSize: 10,
    },
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    photoWrapper: {
        width: '30%',
        marginBottom: 10,
        marginRight: '3%',
    },
    photo: {
        width: '100%',
        height: 100,
        objectFit: 'cover',
        border: '1 solid #ddd',
    },
    photoLabel: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
    },
    conclusionBox: {
        border: '1 solid #000',
        padding: 10,
        marginTop: 10,
        backgroundColor: '#fafafa',
    },
    conclusionTitle: {
        fontWeight: 'bold',
        fontSize: 11,
        marginBottom: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        paddingTop: 10,
        borderTop: '1 solid #ddd',
    },
    footerText: {
        fontSize: 8,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 2,
        fontFamily: 'Courier',
    },
    signatureBlock: {
        marginTop: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signatureLine: {
        width: 200,
        borderTop: '1 solid #000',
        marginBottom: 5,
    },
    signatureName: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    hashContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
})

// ==================================================
// Função para gerar hash de integridade
// ==================================================
function generateIntegrityHash(report: TechnicalReport, order: OrderData): string {
    const str = `${report.id}-${order.displayId}-${report.conclusion}-${report.created_at}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(16, '0') // 16 chars hex
}

// ==================================================
// Formatar endereço
// ==================================================
function formatAddress(address?: StoreSettings['address']): string {
    if (!address) return ''
    const parts = [
        address.street,
        address.number,
        address.neighborhood,
        address.city,
        address.state,
    ].filter(Boolean)
    return parts.join(', ')
}

// ==================================================
// Componente Documento PDF
// ==================================================
function TechnicalReportDocument({
    report,
    order,
    settings
}: {
    report: TechnicalReport
    order: OrderData
    settings: StoreSettings
}) {
    const osNumber = String(order.displayId).padStart(4, '0')
    const reportDate = formatDateToLocal(report.created_at, 'dd/MM/yyyy HH:mm')
    const hash = generateIntegrityHash(report, order)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                {settings.logo_url ? (
                    <View style={styles.headerWithLogo}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoTextWfix}>WFIX </Text>
                            <Text style={styles.logoTextTech}>Tech</Text>
                        </View>
                        <View style={styles.companyInfo}>
                            {settings.legal_document && (
                                <Text style={styles.companyDetail}>CNPJ/CPF: {settings.legal_document}</Text>
                            )}
                            {settings.phone && (
                                <Text style={styles.companyDetail}>Tel: {settings.phone}</Text>
                            )}
                            {settings.address && (
                                <Text style={styles.companyDetail}>{formatAddress(settings.address)}</Text>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.header}>
                        <Text style={styles.title}>{settings.trade_name.toUpperCase()}</Text>
                        <Text style={styles.subtitle}>Soluções Especializadas em Tecnologia</Text>
                    </View>
                )}

                <Text style={styles.title}>LAUDO TÉCNICO PERICIAL</Text>
                <Text style={styles.subtitle}>Referente à Ordem de Serviço Nº {osNumber}</Text>
                <Text style={[styles.subtitle, { marginBottom: 20 }]}>Data de Emissão: {reportDate}</Text>

                {/* Dados do Equipamento */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. IDENTIFICAÇÃO DO EQUIPAMENTO</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tipo:</Text>
                        <Text style={styles.value}>{order.equipmentType}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Marca/Modelo:</Text>
                        <Text style={styles.value}>{order.equipmentBrand} {order.equipmentModel}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Cliente:</Text>
                        <Text style={styles.value}>{order.customerName}</Text>
                    </View>
                </View>

                {/* Relato vs Constatação */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. RELATO DO DEFEITO (CLIENTE)</Text>
                    <Text style={styles.textBlock}>
                        {order.diagnosisText || 'Não informado.'}
                    </Text>
                </View>

                {/* Testes Realizados */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. PROCEDIMENTOS E TESTES REALIZADOS</Text>
                    {report.tests_performed && report.tests_performed.length > 0 ? (
                        report.tests_performed.map((test, index) => (
                            <View key={index} style={styles.testItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text>{test}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.textBlock}>Nenhum teste específico registrado.</Text>
                    )}
                </View>

                {/* Análise Técnica */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. ANÁLISE TÉCNICA DETALHADA</Text>
                    <Text style={styles.textBlock}>{report.technical_analysis}</Text>
                </View>

                {/* Conclusão */}
                <View style={styles.section}>
                    <View style={styles.conclusionBox}>
                        <Text style={styles.conclusionTitle}>5. CONCLUSÃO TÉCNICA</Text>
                        <Text style={[styles.textBlock, { marginBottom: 0 }]}>{report.conclusion}</Text>
                    </View>
                </View>

                {/* Evidências Fotográficas */}
                {report.photos_evidence && report.photos_evidence.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>6. EVIDÊNCIAS FOTOGRÁFICAS</Text>
                        <View style={styles.photosContainer}>
                            {report.photos_evidence.map((url, index) => (
                                <View key={index} style={styles.photoWrapper}>
                                    <Image style={styles.photo} src={url} />
                                    <Text style={styles.photoLabel}>Evidência #{index + 1}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Rodapé e Assinatura */}
                <View style={styles.footer}>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureName}>Departamento Técnico - {settings.trade_name}</Text>
                    </View>

                    <View style={styles.hashContainer}>
                        <Text style={styles.footerText}>
                            Documento gerado eletronicamente em {reportDate}
                        </Text>
                        <Text style={styles.footerText}>
                            ID do Laudo: {report.id}
                        </Text>
                        <Text style={styles.footerText}>
                            Integridade (Hash): {hash}
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
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

        // Usar canvas para re-codificar a imagem como JPEG
        // Isso converte WebP (não suportado por react-pdf) para JPEG
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

interface TechnicalReportPdfButtonProps {
    report: TechnicalReport
    orderData: OrderData
    storeSettings: StoreSettings
    label?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export default function TechnicalReportPdfButton({
    report,
    orderData,
    storeSettings,
    label = "Baixar Laudo Técnico",
    variant = "outline"
}: TechnicalReportPdfButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const osNumber = String(orderData.displayId).padStart(4, '0')
    const fileName = `Laudo_Tecnico_OS_${osNumber}.pdf`

    const handleDownload = useCallback(async () => {
        setIsGenerating(true)
        try {
            // Converter logo e evidências para base64
            let logoBase64: string | undefined
            if (storeSettings.logo_url?.startsWith('http')) {
                logoBase64 = (await imageUrlToBase64(storeSettings.logo_url)) || undefined
            }

            const photoBase64 = report.photos_evidence
                ? await convertAllImages(report.photos_evidence)
                : []

            const settingsWithBase64: StoreSettings = {
                ...storeSettings,
                logo_url: logoBase64 || storeSettings.logo_url,
            }

            const reportWithBase64 = {
                ...report,
                photos_evidence: photoBase64,
            }

            // Gerar o PDF blob
            const blob = await pdf(
                <TechnicalReportDocument report={reportWithBase64} order={orderData} settings={settingsWithBase64} />
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
    }, [report, orderData, storeSettings, fileName])

    return (
        <Button variant={variant} disabled={isGenerating} onClick={handleDownload} className="w-full sm:w-auto">
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                </>
            ) : (
                <>
                    <FileDown className="mr-2 h-4 w-4" />
                    {label}
                </>
            )}
        </Button>
    )
}
