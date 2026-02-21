'use client'

import { useState, useEffect } from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { formatDateToLocal } from '@/lib/date-utils'

// ==================================================
// Estilos do PDF
// ==================================================
const styles = StyleSheet.create({
    page: {
        padding: 40,
        paddingBottom: 120, // Aumentado para não sobrepor o footer fixo
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2 solid #333',
        paddingBottom: 10,
    },
    headerWithLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: '2 solid #333',
        paddingBottom: 10,
    },
    logo: {
        width: 80,
        height: 40,
        objectFit: 'contain',
    },
    companyInfo: {
        flex: 1,
        textAlign: 'right',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        color: '#666',
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
        width: '40%',
        fontWeight: 'bold',
    },
    value: {
        width: '60%',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#333',
        color: '#fff',
        padding: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1 solid #ddd',
        padding: 5,
    },
    tableCell: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#6B7280', // Cinza escuro técnico
        textAlign: 'center',
        marginBottom: 2,
        fontFamily: 'Courier',
    },
    warning: {
        backgroundColor: '#fff3cd',
        padding: 10,
        marginTop: 10,
        borderRadius: 4,
    },
    warningText: {
        fontSize: 9,
        color: '#856404',
    },
    hash: {
        fontSize: 7,
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
    },
    photo: {
        width: 100,
        height: 75,
        marginRight: 10,
        objectFit: 'cover',
    },
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    digitalSignatureText: {
        fontSize: 7,
        color: '#6B7280',
        textAlign: 'center',
        fontFamily: 'Courier',
        marginBottom: 1,
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
    displayId: string | number
    customerName: string
    customerPhone: string
    equipmentType: string
    equipmentBrand: string
    equipmentModel: string
    diagnosisText: string
    laborCost: number
    photosCheckout: string[]
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
// Componente PDF
function WarrantyDocument({ data, settings }: { data: OrderData; settings: StoreSettings }) {
    const osNumber = String(data.displayId).padStart(4, '0')
    const hash = generateHash(data, settings.trade_name)
    const finishedDate = formatDateToLocal(data.finishedAt, 'dd/MM/yyyy')
    const warrantyDays = settings.warranty_days_labor || 90

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header com Logo */}
                {settings.logo_url ? (
                    <View style={styles.headerWithLogo}>
                        <Image style={styles.logo} src={settings.logo_url} />
                        <View style={styles.companyInfo}>
                            <Text style={styles.companyName}>{settings.trade_name}</Text>
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
                        <Text style={styles.subtitle}>Termo de Garantia e Entrega</Text>
                        {settings.legal_document && (
                            <Text style={[styles.subtitle, { fontSize: 9 }]}>CNPJ/CPF: {settings.legal_document}</Text>
                        )}
                    </View>
                )}

                {/* Dados da OS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DADOS DA ORDEM DE SERVIÇO</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nº da OS:</Text>
                        <Text style={styles.value}>#{osNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Data de Entrega:</Text>
                        <Text style={styles.value}>{finishedDate}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Cliente:</Text>
                        <Text style={styles.value}>{data.customerName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Telefone:</Text>
                        <Text style={styles.value}>{data.customerPhone}</Text>
                    </View>
                </View>

                {/* Equipamento */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>EQUIPAMENTO</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tipo:</Text>
                        <Text style={styles.value}>{data.equipmentType}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Marca/Modelo:</Text>
                        <Text style={styles.value}>{data.equipmentBrand} {data.equipmentModel}</Text>
                    </View>
                </View>

                {/* Serviço */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SERVIÇO REALIZADO</Text>
                    <Text>{data.diagnosisText || 'Manutenção técnica realizada conforme diagnóstico.'}</Text>
                    <View style={[styles.row, { marginTop: 25, paddingVertical: 5 }]}>
                        <Text style={styles.label}>Mão de Obra:</Text>
                        <Text style={[styles.value, { fontWeight: 'bold' }]}>{formatCurrency(data.laborCost)}</Text>
                    </View>
                </View>

                {/* Bônus: Suporte Remoto */}
                <View style={[styles.section, { backgroundColor: '#F9FAFB', padding: 8, borderRadius: 4, border: '1 dashed #E5E7EB' }]}>
                    <Text style={[styles.sectionTitle, { backgroundColor: 'transparent', marginBottom: 4, color: '#059669' }]}>
                        BÔNUS: SUPORTE TÉCNICO REMOTO
                    </Text>
                    <Text style={{ fontSize: 8, color: '#374151', lineHeight: 1.4 }}>
                        Como cortesia, esta Ordem de Serviço concede ao cliente o direito a <Text style={{ fontWeight: 'bold' }}>02 (dois) Tickets de Suporte Remoto</Text> (via WhatsApp ou Acesso Remoto) para dúvidas de configuração ou ajustes finos relacionados ao serviço executado.
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 4, gap: 10 }}>
                        <Text style={{ fontSize: 8, color: '#374151' }}>
                            <Text style={{ fontWeight: 'bold' }}>Validade:</Text> 30 dias corridos.
                        </Text>
                        <Text style={{ fontSize: 8, color: '#374151' }}>
                            <Text style={{ fontWeight: 'bold' }}>Regra:</Text> Cada ticket cobre 1 incidente de até 30min. Suportes adicionais serão cobrados à parte.
                        </Text>
                    </View>
                </View>

                {/* Peças Externas */}
                {data.externalParts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>PEÇAS (COMPRA ASSISTIDA)</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableCell}>Peça</Text>
                                <Text style={styles.tableCell}>Valor Estimado</Text>
                            </View>
                            {data.externalParts.map((part, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{part.name}</Text>
                                    <Text style={styles.tableCell}>{part.price ? formatCurrency(part.price) : '—'}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.warning}>
                            <Text style={styles.warningText}>
                                ⚠️ ATENÇÃO: As peças listadas acima foram adquiridas pelo CLIENTE em fornecedores externos.
                                A garantia das peças é de responsabilidade direta do vendedor, conforme Art. 18 do CDC.
                                A {settings.trade_name} não se responsabiliza por defeitos nas peças externas.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Fotos */}
                {data.photosCheckout.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>REGISTRO FOTOGRÁFICO (ENTREGA)</Text>
                        <View style={styles.photosContainer}>
                            {data.photosCheckout.slice(0, 4).map((url, index) => (
                                <Image key={index} style={styles.photo} src={url} />
                            ))}
                        </View>
                    </View>
                )}

                <View style={[styles.footer, { borderTopWidth: 1, borderColor: '#E5E7EB' }]}>
                    {/* Audit Trail - Assinatura Digital */}
                    {data.signatureEvidence && (
                        <View style={{ marginBottom: 5 }}>
                            <Text style={styles.digitalSignatureText}>
                                DOCUMENTO ASSINADO DIGITALMENTE VIA {settings.trade_name.toUpperCase()}
                            </Text>
                            <Text style={styles.digitalSignatureText}>
                                Assinado por: {data.customerName} | Data/Hora: {formatDateToLocal(data.signatureEvidence.accepted_at, 'dd/MM/yyyy HH:mm:ss')}
                            </Text>
                            <Text style={styles.digitalSignatureText}>
                                IP Registrado: {maskIp(data.signatureEvidence.ip_address)} (Registro de auditoria completo mantido em base segura via Hash)
                            </Text>
                            <Text style={styles.digitalSignatureText}>
                                Hash de Integridade: {hash}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.footerText}>
                        TERMO DE GARANTIA: A {settings.trade_name.toUpperCase()} oferece garantia de {warrantyDays} ({warrantyDays === 90 ? 'noventa' : warrantyDays}) dias
                        sobre a MÃO DE OBRA do serviço prestado, contados a partir da data de entrega.
                    </Text>
                    <Text style={styles.footerText}>
                        Esta garantia não cobre defeitos causados por mau uso, quedas, líquidos, ou peças adquiridas externamente.
                    </Text>
                    <Text style={[styles.footerText, { marginTop: 2 }]}>
                        Em conformidade com a MP 2.200-2/2001 e Lei 14.063/2020 (Assinatura Eletrônica).
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
    const osNumber = String(orderData.displayId).padStart(4, '0')
    const storeName = storeSettings.trade_name.replace(/\s+/g, '_').toUpperCase()
    const fileName = `${storeName}_OS_${osNumber}_Garantia.pdf`

    return (
        <PDFDownloadLink
            document={<WarrantyDocument data={orderData} settings={storeSettings} />}
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
                            {!icon && "Baixar Termo de Garantia"}
                        </>
                    )}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
export type { OrderData, StoreSettings }
