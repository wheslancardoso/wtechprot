'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'

// ==================================================
// Estilos do PDF
// ==================================================
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2 solid #333',
        paddingBottom: 10,
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
        left: 40,
        right: 40,
        borderTop: '1 solid #333',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
        marginBottom: 3,
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
})

// ==================================================
// Tipo de dados da OS
// ==================================================
interface OrderData {
    displayId: number
    customerName: string
    customerPhone: string
    equipmentType: string
    equipmentBrand?: string
    equipmentModel?: string
    diagnosisText?: string
    laborCost: number
    externalParts: Array<{
        name: string
        url?: string
        price?: number
    }>
    photosCheckout: string[]
    finishedAt: string
}

// ==================================================
// Função para gerar hash simples
// ==================================================
function generateHash(data: OrderData): string {
    const str = `${data.displayId}-${data.customerName}-${data.laborCost}-${data.finishedAt}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
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
// Componente PDF
// ==================================================
function WarrantyDocument({ data }: { data: OrderData }) {
    const osNumber = String(data.displayId).padStart(4, '0')
    const hash = generateHash(data)
    const finishedDate = new Date(data.finishedAt).toLocaleDateString('pt-BR')
    const totalExternalParts = data.externalParts.reduce((sum, p) => sum + (p.price || 0), 0)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>WTECH ASSISTÊNCIA TÉCNICA</Text>
                    <Text style={styles.subtitle}>Termo de Garantia e Entrega</Text>
                </View>

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
                    <View style={[styles.row, { marginTop: 10 }]}>
                        <Text style={styles.label}>Mão de Obra:</Text>
                        <Text style={[styles.value, { fontWeight: 'bold' }]}>{formatCurrency(data.laborCost)}</Text>
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
                                A WTECH não se responsabiliza por defeitos nas peças externas.
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

                {/* Rodapé Legal */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        TERMO DE GARANTIA: A WTECH ASSISTÊNCIA TÉCNICA oferece garantia de 90 (noventa) dias
                        sobre a MÃO DE OBRA do serviço prestado, contados a partir da data de entrega.
                    </Text>
                    <Text style={styles.footerText}>
                        Esta garantia não cobre defeitos causados por mau uso, quedas, líquidos, ou peças adquiridas externamente.
                    </Text>
                    <Text style={styles.hash}>
                        ID de Verificação: WTECH-{osNumber}-{hash}
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
}

export default function WarrantyPdfButton({ orderData }: WarrantyPdfButtonProps) {
    const osNumber = String(orderData.displayId).padStart(4, '0')
    const fileName = `WTECH_OS_${osNumber}_Garantia.pdf`

    return (
        <PDFDownloadLink
            document={<WarrantyDocument data={orderData} />}
            fileName={fileName}
        >
            {({ loading }: { loading: boolean }) => (
                <Button variant="outline" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gerando PDF...
                        </>
                    ) : (
                        <>
                            <FileDown className="mr-2 h-4 w-4" />
                            Baixar Termo de Garantia
                        </>
                    )}
                </Button>
            )}
        </PDFDownloadLink>
    )
}

// Export types
export type { OrderData }
