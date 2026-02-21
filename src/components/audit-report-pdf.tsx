import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { formatDateToLocal } from '@/lib/date-utils'
import type { OrderData, StoreSettings } from './warranty-pdf' // Reusing types

// Font Registration
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', fontWeight: 500 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf', fontWeight: 700 },
    ]
})

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Inter',
        fontSize: 10,
        color: '#1f2937', // gray-800
        backgroundColor: '#ffffff'
    },
    // Header
    headerWithLogo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb', // gray-200
    },
    logo: {
        width: 140,
        height: 60,
        objectFit: 'contain',
    },
    companyInfo: {
        alignItems: 'flex-end',
    },
    header: {
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb', // gray-200
        alignItems: 'center',
    },
    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    companyDetail: {
        fontSize: 9,
        color: '#4b5563', // gray-600
        marginBottom: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 6,
        color: '#111827', // gray-900
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        color: '#4b5563', // gray-600
        marginBottom: 2,
    },
    // Sections
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#111827',
        backgroundColor: '#f3f4f6', // gray-100
        padding: 6,
        borderRadius: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        width: 120,
        fontWeight: 'medium',
        color: '#4b5563',
    },
    value: {
        flex: 1,
        color: '#111827',
    },
    // Audit Section details
    auditBox: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fafafa',
    },
    auditRow: {
        flexDirection: 'row',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 8,
    },
    auditRowLast: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    auditLabel: {
        width: 150,
        fontWeight: 'bold',
        color: '#374151',
        fontSize: 9,
    },
    auditValue: {
        flex: 1,
        color: '#111827',
        fontSize: 9,
        fontFamily: 'Helvetica', // Better for mono-like hashes if no mono font
    },
    hashText: {
        fontSize: 8,
        color: '#ef4444', // red-500
        fontWeight: 'bold',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 10,
        lineHeight: 1.4,
    },
})

// Formatar endereço
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

export function AuditReportDocument({ data, settings }: { data: OrderData; settings: StoreSettings }) {
    const osNumber = String(data.displayId).padStart(4, '0')
    const evidence = data.signatureEvidence

    // Se não houver evidência formal, a geração desse PDF não faz sentido, mas renderizamos amigavelmente
    if (!evidence) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.title}>CERTIFICADO DE AUDITORIA INDISPONÍVEL</Text>
                        <Text style={styles.subtitle}>Esta Ordem de Serviço não possui assinatura digital Click-Wrap.</Text>
                    </View>
                </Page>
            </Document>
        )
    }

    const acceptedAt = evidence.accepted_at ? formatDateToLocal(evidence.accepted_at, "dd/MM/yyyy 'às' HH:mm:ss") : 'N/A'
    const ipAddress = evidence.ip_address || 'N/A'
    const userAgent = evidence.device_fingerprint || 'N/A'
    const hash = evidence.integrity_hash || 'N/A'

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
                        {settings.legal_document && (
                            <Text style={styles.subtitle}>CNPJ/CPF: {settings.legal_document}</Text>
                        )}
                    </View>
                )}

                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.title}>CERTIFICADO DE AUDITORIA E ASSINATURA ELETRÔNICA</Text>
                    <Text style={[styles.subtitle, { marginTop: 4, lineHeight: 1.4 }]}>
                        Documento comprobatório de validade e integridade de aceite digital,
                        gerado via plataforma WFIX Tech.
                    </Text>
                </View>

                {/* Dados da OS e Cliente */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. IDENTIFICAÇÃO DO SERVIÇO</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nº da Ordem de Serviço:</Text>
                        <Text style={styles.value}>#{osNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nome do Cliente:</Text>
                        <Text style={styles.value}>{data.customerName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Telefone Registrado:</Text>
                        <Text style={styles.value}>{data.customerPhone}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Equipamento:</Text>
                        <Text style={styles.value}>{data.equipmentType} {data.equipmentBrand} {data.equipmentModel}</Text>
                    </View>
                </View>

                {/* Registro de Auditoria (Evidências) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. REGISTRO ELETRÔNICO DE CONSENTIMENTO (LOG DE AUDITORIA)</Text>
                    <View style={styles.auditBox}>
                        <View style={styles.auditRow}>
                            <Text style={styles.auditLabel}>Tipo de Assinatura:</Text>
                            <Text style={styles.auditValue}>Aceite Eletrônico (Click-Wrap Agreement)</Text>
                        </View>
                        <View style={styles.auditRow}>
                            <Text style={styles.auditLabel}>Data e Hora do Aceite (Local):</Text>
                            <Text style={styles.auditValue}>{acceptedAt}</Text>
                        </View>
                        <View style={styles.auditRow}>
                            <Text style={styles.auditLabel}>Endereço IP de Origem:</Text>
                            <Text style={[styles.auditValue, { fontWeight: 'bold' }]}>{ipAddress}</Text>
                        </View>
                        <View style={styles.auditRow}>
                            <Text style={styles.auditLabel}>Dispositivo (User-Agent):</Text>
                            <Text style={styles.auditValue}>{userAgent}</Text>
                        </View>
                        <View style={styles.auditRowLast}>
                            <Text style={styles.auditLabel}>Hash de Integridade (SHA-256):</Text>
                            <Text style={[styles.auditValue, styles.hashText]}>{hash}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer / Base de Conhecimento */}
                <View style={styles.footer}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>VALIDADE JURÍDICA DESTE DOCUMENTO</Text>
                    <Text style={{ marginBottom: 4 }}>
                        Este documento atesta que a aprovação do orçamento correspondente à Ordem de Serviço nº {osNumber} foi
                        realizada eletronicamente e devidamente registrada nos servidores do sistema.
                    </Text>
                    <Text>
                        De acordo com a Medida Provisória nº 2.200-2/2001 (Art. 10º, § 2º) e a Lei nº 14.063/2020, o aceite
                        eletrônico com comprovação de autoria (IP e Timestamp) e integridade (Hash) possui total validade
                        jurídica no Brasil como meio hábil de prova, sendo equiparado à assinatura física para comprovação de
                        autorização de serviços.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

// ==================================================
// Botão de Download
// ==================================================
interface AuditReportPdfButtonProps {
    orderData: OrderData
    storeSettings: StoreSettings
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    icon?: React.ReactNode
}

export default function AuditReportPdfButton({ orderData, storeSettings, className, variant = "outline", icon }: AuditReportPdfButtonProps) {
    const osNumber = String(orderData.displayId).padStart(4, '0')
    const storeName = storeSettings.trade_name.replace(/\s+/g, '_').toUpperCase()
    const fileName = `${storeName}_OS_${osNumber}_Certificado_Auditoria.pdf`

    return (
        <PDFDownloadLink
            document={<AuditReportDocument data={orderData} settings={storeSettings} />}
            fileName={fileName}
            className={className}
        >
            {({ loading }) => (
                <Button
                    variant={variant}
                    disabled={loading}
                    className={`w-full ${icon ? 'p-0 h-full bg-transparent hover:bg-transparent justify-start' : 'justify-start'}`}
                >
                    {loading ? (
                        <>
                            <span className={`animate-spin ${icon ? 'h-4 w-4' : 'mr-2 h-4 w-4'}`}>⏳</span>
                            {!icon && "Gerando PDF..."}
                        </>
                    ) : (
                        <>
                            {icon ? icon : null}
                            {!icon && "Baixar Certificado de Auditoria"}
                        </>
                    )}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
