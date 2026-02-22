'use client'

import { useState, useEffect } from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { formatDateToLocal } from '@/lib/date-utils'

// ==================================================
// Cores e Variáveis
// ==================================================
const primaryColor = '#059669' // Emerald 600
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
        paddingBottom: 150, // Aumentado para não sobrepor o footer fixo
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
    logo: {
        width: 120,
        height: 50,
        objectFit: 'contain',
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
        borderRadius: 2,
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

    // Service Description Box
    serviceBox: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 4,
        padding: 12,
        marginBottom: 15,
    },
    serviceText: {
        fontSize: 10,
        lineHeight: 1.4,
        color: textColor,
        marginBottom: 12,
    },
    costContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: borderColor,
        paddingTop: 10,
    },
    costLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: mutedColor,
        textTransform: 'uppercase',
        marginRight: 10,
    },
    costValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: primaryColor,
    },

    // Bonus section
    bonusSection: {
        backgroundColor: '#ecfdf5',
        borderWidth: 1,
        borderColor: '#a7f3d0',
        borderRadius: 4,
        padding: 10,
        marginBottom: 15,
    },
    bonusTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#047857',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    bonusText: {
        fontSize: 8,
        color: '#064e3b',
        lineHeight: 1.3,
    },
    bonusDetailsContainer: {
        flexDirection: 'row',
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#d1fae5',
        gap: 15,
    },

    // Table
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 4,
        overflow: 'hidden',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: bgColor,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
    },
    tableHeaderCell: {
        fontSize: 8,
        fontWeight: 'bold',
        color: mutedColor,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    tableCell: {
        fontSize: 9,
        color: textColor,
    },
    col1: { flex: 3 },
    col2: { flex: 1, textAlign: 'right' },

    // Warnings
    warningBox: {
        backgroundColor: '#fffbeb',
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
        padding: 8,
        marginTop: 8,
        borderRadius: 2,
    },
    warningText: {
        fontSize: 7.5,
        color: '#b45309',
        lineHeight: 1.3,
        textAlign: 'justify',
    },

    // Checklist
    checklistGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 4,
        padding: 10,
    },
    checklistItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkIcon: {
        fontSize: 10,
        color: primaryColor,
    },
    uncheckIcon: {
        fontSize: 10,
        color: '#cbd5e1',
    },
    checkText: {
        fontSize: 8,
        color: textColor,
    },
    checkTextMuted: {
        fontSize: 8,
        color: mutedColor,
    },
    iconWrapper: {
        width: 14,
        alignItems: 'center'
    },

    // Photos
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 5,
    },
    photoImage: {
        width: '23%',
        height: 70,
        borderRadius: 4,
        objectFit: 'cover',
        borderWidth: 1,
        borderColor: borderColor,
    },

    // Footer
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
    warrantyText: {
        fontSize: 7,
        color: textColor,
        fontWeight: 'bold',
        textAlign: 'justify',
        lineHeight: 1.3,
        marginBottom: 2,
    },
    warrantyDisclaimer: {
        fontSize: 7,
        color: mutedColor,
        textAlign: 'justify',
        lineHeight: 1.3,
    },
    legalText: {
        fontSize: 6,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 6,
    }
})

import type { StoreSettings } from '@/components/warranty-pdf'

import type { OrderData as BaseOrderData } from '@/components/warranty-pdf'

interface OrderData extends BaseOrderData {
    photosCheckin?: string[]
}

// ==================================================
// Função para gerar hash simples
// ==================================================
function generateHash(data: OrderData, storeName: string): string {
    const str = `${data.displayId}-${storeName}-${data.laborCost}-${data.finishedAt}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
}

// ==================================================
// Função auxiliar para mascarar o IP (Segurança/LGPD)
// ==================================================
function maskIp(ip?: string) {
    if (!ip) return 'N/A'
    const clean = ip.replace('::ffff:', '')

    // Se for IPv4 (x.x.x.x)
    if (clean.includes('.')) {
        const parts = clean.split('.')
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.***.***`
        }
    }

    // Se for IPv6 ou outro formato, mascara a metade final
    if (clean.length > 8) {
        return `${clean.substring(0, Math.floor(clean.length / 2))}***`
    }

    return '***'
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
// Componente PDF
// ==================================================
function DeliveryReceiptDocument({ data, settings }: { data: OrderData; settings: StoreSettings }) {
    const osNumber = String(data.displayId).padStart(4, '0')
    const hash = generateHash(data, settings.trade_name)
    const finishedDate = formatDateToLocal(data.finishedAt, 'dd/MM/yyyy')

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    {settings.logo_url ? (
                        <Image style={styles.logo} src={settings.logo_url} />
                    ) : (
                        <View style={{ width: 120 }}>
                            <Text style={styles.companyName}>{settings.trade_name.toUpperCase()}</Text>
                        </View>
                    )}
                    <View style={styles.headerRight}>
                        <Text style={styles.documentTitle}>Termo de Entrega</Text>
                        <Text style={styles.companyName}>{settings.trade_name}</Text>
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

                {/* 2-Column Grid for OS and Equipment Data */}
                <View style={[styles.grid2Col, styles.section]}>
                    {/* OS / Client Column */}
                    <View style={styles.col}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>OS:</Text>
                            <Text style={[styles.value, { fontWeight: 'bold' }]}>#{osNumber}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Cliente:</Text>
                            <Text style={styles.value}>{data.customerName}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Telefone:</Text>
                            <Text style={styles.value}>{data.customerPhone}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Entrega:</Text>
                            <Text style={styles.value}>{finishedDate}</Text>
                        </View>
                    </View>

                    {/* Equipment Column */}
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
                    </View>
                </View>

                {/* Service Details Box */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Serviço Realizado</Text>
                    </View>
                    <View style={styles.serviceBox}>
                        <Text style={styles.serviceText}>
                            {data.diagnosisText || 'Manutenção técnica realizada conforme diagnóstico preliminar.'}
                        </Text>
                        <View style={styles.costContainer}>
                            <Text style={styles.costLabel}>Total da Mão de Obra</Text>
                            <Text style={styles.costValue}>{formatCurrency(data.laborCost)}</Text>
                        </View>
                    </View>
                </View>

                {/* Bônus: Suporte Remoto */}
                <View style={styles.bonusSection}>
                    <Text style={styles.bonusTitle}>BÔNUS EXCLUSIVO: SUPORTE REMOTO</Text>
                    <Text style={styles.bonusText}>
                        Como cortesia pela sua confiança, esta OS lhe dá direito a 02 (dois) Tickets de Suporte Técnico (Acesso Remoto ou WhatsApp) para dúvidas e ajustes finos pertinentes ao serviço.
                    </Text>
                    <View style={styles.bonusDetailsContainer}>
                        <Text style={{ fontSize: 7, color: '#065f46' }}>
                            <Text style={{ fontWeight: 'bold' }}>Validade:</Text> 30 dias após entrega.
                        </Text>
                        <Text style={{ fontSize: 7, color: '#065f46' }}>
                            <Text style={{ fontWeight: 'bold' }}>Regra:</Text> Cada ticket = 1 suporte de até 30min.
                        </Text>
                    </View>
                </View>

                {/* Checklist de Entrega */}
                {data.checkout_checklist && Object.keys(data.checkout_checklist).length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Checklist e Validação na Entrega</Text>
                        </View>
                        <View style={styles.checklistGrid}>
                            {Object.entries(data.checkout_checklist).map(([key, value]) => {
                                const label = key === 'limpeza_ok' ? 'Limpeza higiênica realizada' :
                                    key === 'testes_ok' ? 'Testes de bancada aprovados' :
                                        key === 'acessorios_ok' ? 'Acessórios originais devolvidos' :
                                            key === 'cliente_ciente' ? 'Ciente das regras de garantia' : key
                                return (
                                    <View key={key} style={styles.checklistItem}>
                                        <View style={styles.iconWrapper}>
                                            <Text style={value ? styles.checkIcon : styles.uncheckIcon}>{value ? '☑' : '☐'}</Text>
                                        </View>
                                        <Text style={value ? styles.checkText : styles.checkTextMuted}>{label}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                )}

                {/* Peças Externas */}
                {data.externalParts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Peças de Fornecedores Externos</Text>
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
                                As peças listadas foram adquiridas em caráter de fornecimento de terceiros. A garantia destas peças recai diretamente sobre a distribuidora/fabricante original, não integrando a garantia de mão de obra descrita neste termo.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Fotos de Entrada (Check-in) */}
                {data.photosCheckin && data.photosCheckin.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Evidências de Entrada (Check-in)</Text>
                        </View>
                        <View style={styles.photosGrid}>
                            {data.photosCheckin.slice(0, 4).map((url, index) => (
                                <Image key={index} style={styles.photoImage} src={url} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Fotos */}
                {data.photosCheckout.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Evidências de Saída (Check-out)</Text>
                        </View>
                        <View style={styles.photosGrid}>
                            {data.photosCheckout.slice(0, 4).map((url, index) => (
                                <Image key={index} style={styles.photoImage} src={url} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Footer Fixado (Absolute) */}
                <View style={styles.footer}>
                    {data.signatureEvidence && (
                        <View style={styles.signatureBox}>
                            <View style={styles.signatureIcon}>
                                <Text style={{ fontSize: 24, color: primaryColor }}>☑</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.signatureTitle}>Assinatura Eletrônica Qualificada</Text>
                                <Text style={styles.signatureText}>
                                    Assinado por {data.customerName} em {formatDateToLocal(data.signatureEvidence.accepted_at, 'dd/MM/yyyy às HH:mm:ss')}
                                </Text>
                                <Text style={styles.signatureText}>
                                    IP Validador: {maskIp(data.signatureEvidence.ip_address)} | Auth Method: OTP Secure
                                </Text>
                                <Text style={styles.signatureText}>
                                    SHA-256 Hash: {hash}
                                </Text>
                            </View>
                        </View>
                    )}

                    <Text style={styles.warrantyText}>
                        TERMO DE ENTREGA: Declaro que recebi o equipamento listado acima nas condições descritas, com os serviços executados a contento e os acessórios pertinentes devolvidos.
                    </Text>
                    <Text style={styles.legalText}>
                        Documento regido e válido conforme MP 2.200-2/2001 e Lei 14.063/2020 para Assinatura Eletrônica.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

// ==================================================
// Botão de Download
// ==================================================
interface DeliveryReceiptPdfButtonProps {
    orderData: OrderData
    storeSettings: StoreSettings
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    icon?: React.ReactNode
}

export default function DeliveryReceiptPdfButton({ orderData, storeSettings, className, variant = "outline", icon }: DeliveryReceiptPdfButtonProps) {
    const osNumber = String(orderData.displayId).padStart(4, '0')
    const storeName = storeSettings.trade_name.replace(/\s+/g, '_').toUpperCase()
    const fileName = `${storeName}_OS_${osNumber}_Entrega.pdf`

    return (
        <PDFDownloadLink
            document={<DeliveryReceiptDocument data={orderData} settings={storeSettings} />}
            fileName={fileName}
            className={className}
        >
            {({ loading }) => (
                <Button
                    variant={variant}
                    disabled={loading}
                    className={`w-full ${icon ? 'p-0 h-full bg-transparent hover:bg-transparent' : ''}`}
                >
                    {loading ? (
                        <>
                            <Loader2 className={`animate-spin ${icon ? 'h-4 w-4' : 'mr-2 h-4 w-4'}`} />
                            {!icon && "Gerando PDF..."}
                        </>
                    ) : (
                        <>
                            {icon ? icon : <FileDown className="mr-2 h-4 w-4" />}
                            {!icon && "Baixar Termo de Entrega"}
                        </>
                    )}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
export type { OrderData, StoreSettings }
