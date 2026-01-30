'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { formatDateToLocal } from '@/lib/date-utils'

// ==================================================
// Estilos do PDF (Inspirado no WarrantyPDF)
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
    logo: {
        width: 80,
        height: 40,
        objectFit: 'contain',
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
    titleBox: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        marginBottom: 20,
        borderLeft: '4 solid #333',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 10,
        marginTop: 4,
        color: '#444',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 6,
        borderBottom: '1 solid #ddd',
        paddingBottom: 2,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: '35%',
        fontWeight: 'bold',
        color: '#555',
    },
    value: {
        width: '65%',
    },
    checklist: {
        marginTop: 5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    checkItem: {
        backgroundColor: '#eef2ff', // Indigo 50
        padding: '4 8',
        borderRadius: 4,
        fontSize: 9,
        border: '1 solid #c7d2fe',
    },
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
        gap: 5,
    },
    photo: {
        width: 120,
        height: 90,
        objectFit: 'cover',
        borderRadius: 2,
        backgroundColor: '#f9f9f9',
    },
    legalTerm: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f9fafb',
        border: '1 solid #e5e7eb',
        borderRadius: 4,
    },
    legalText: {
        fontSize: 9,
        lineHeight: 1.4,
        textAlign: 'justify',
        color: '#374151',
    },
    signatureSection: {
        marginTop: 30,
        alignItems: 'center',
    },
    signatureImage: {
        width: 200,
        height: 80,
        objectFit: 'contain',
    },
    signatureLine: {
        width: 250,
        borderTop: '1 solid #333',
        marginTop: 5,
    },
    signatureLabel: {
        fontSize: 9,
        marginTop: 4,
        color: '#555',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
        borderTop: '1 solid #e5e7eb',
        paddingTop: 10,
    },
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
}

interface StoreSettings {
    trade_name: string
    logo_url?: string | null
    phone?: string | null
    address?: any
}

function WithdrawalTermDocument({ data, settings }: { data: CustodyData; settings: StoreSettings }) {
    const signedDate = formatDateToLocal(data.signedAt, 'dd/MM/yyyy HH:mm:ss')

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerWithLogo}>
                    {settings.logo_url && <Image style={styles.logo} src={settings.logo_url} />}
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{settings.trade_name}</Text>
                        {settings.phone && <Text style={styles.companyDetail}>Tel: {settings.phone}</Text>}
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleBox}>
                    <Text style={styles.title}>Termo de Retirada e Custódia</Text>
                    <Text style={styles.subtitle}>Check-in de Equipamento (Home Care)</Text>
                </View>

                {/* Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DADOS DO SERVIÇO</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>OS Nº:</Text>
                        <Text style={[styles.value, { fontWeight: 'bold' }]}>#{String(data.orderDisplayId).padStart(4, '0')}</Text>
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

                {/* Equipamento */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>IDENTIFICAÇÃO DO EQUIPAMENTO</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Equipamento:</Text>
                        <Text style={styles.value}>{data.equipmentType} {data.equipmentBrand} {data.equipmentModel}</Text>
                    </View>
                    {data.equipmentSerial && (
                        <View style={styles.row}>
                            <Text style={styles.label}>S/N:</Text>
                            <Text style={styles.value}>{data.equipmentSerial}</Text>
                        </View>
                    )}
                </View>

                {/* Acessórios */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACESSÓRIOS COLETADOS</Text>
                    {data.accessories && data.accessories.length > 0 ? (
                        <View style={styles.checklist}>
                            {data.accessories.map((item, idx) => (
                                <Text key={idx} style={styles.checkItem}>✓ {item}</Text>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#666' }}>Nenhum acessório coletado.</Text>
                    )}
                </View>

                {/* Condições */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONDIÇÕES FÍSICAS REPORTADAS</Text>
                    <Text style={{ fontSize: 9, lineHeight: 1.4, backgroundColor: '#fff', padding: 5, border: '1 solid #eee' }}>
                        {data.conditionNotes || 'Sem avarias visíveis relatadas no momento da coleta.'}
                    </Text>
                </View>

                {/* Termo Legal */}
                <View style={styles.legalTerm}>
                    <Text style={[styles.sectionTitle, { borderBottom: 0, marginBottom: 4 }]}>DECLARAÇÃO DE ENTREGA</Text>
                    <Text style={styles.legalText}>
                        1. Declaro ser o proprietário ou responsável legal pelo equipamento acima descrito.
                        {"\n"}
                        2. Autorizo a {settings.trade_name} a transportar o equipamento para suas dependências para fins de análise técnica e orçamento.
                        {"\n"}
                        3. Confirmo que a lista de acessórios e as condições físicas relatadas conferem com a realidade do aparelho no momento da entrega.
                        {"\n"}
                        4. Estou ciente de que a análise técnica pode exigir a desmontagem do equipamento, o que, em casos raros, pode revelar defeitos ocultos pré-existentes.
                    </Text>
                </View>

                {/* Assinatura */}
                <View style={styles.signatureSection}>
                    {data.signatureUrl ? (
                        <Image style={styles.signatureImage} src={data.signatureUrl} />
                    ) : (
                        <View style={{ borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', padding: 8, borderRadius: 4, alignItems: 'center', width: 200, height: 60, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#555', textTransform: 'uppercase' }}>Assinado Digitalmente (Click-Wrap)</Text>
                            <Text style={{ fontSize: 7, color: '#888', marginTop: 2 }}>{data.integrityHash ? `Hash: ${data.integrityHash.substring(0, 10)}...` : 'Autenticado'}</Text>
                        </View>
                    )}
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureLabel}>Assinado digitalmente por {data.customerName}</Text>
                    <Text style={{ fontSize: 8, color: '#999', marginTop: 2 }}>{signedDate}</Text>
                    {data.geolocation && (
                        <Text style={{ fontSize: 7, color: '#aaa', marginTop: 2 }}>
                            Local da Coleta: {data.geolocation.lat.toFixed(6)}, {data.geolocation.lng.toFixed(6)}
                        </Text>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={{ marginBottom: 2 }}>
                        DOCUMENTO ASSINADO DIGITALMENTE VIA {settings.trade_name.toUpperCase()}
                    </Text>
                    <Text style={{ marginBottom: 2 }}>
                        Assinado por: {data.customerName} | Data/Hora: {signedDate} | IP: {data.custodyIp || 'N/A'}
                    </Text>
                    <Text>Hash de Integridade: {data.integrityHash || 'PENDENTE'}</Text>
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
    const fileName = `Termo_Retirada_OS_${data.orderDisplayId}.pdf`

    return (
        <PDFDownloadLink
            document={<WithdrawalTermDocument data={data} settings={settings} />}
            fileName={fileName}
            className={className}
        >
            {({ loading }: { loading: boolean }) => (
                <Button variant="outline" size="sm" disabled={loading} className="w-full sm:w-auto">
                    {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <FileDown className="mr-2 h-3 w-3" />}
                    {loading ? 'Gerando...' : 'Baixar Termo de Retirada'}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
