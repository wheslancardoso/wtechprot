'use client'

import type { PartsSourcingMode } from '@/types/database'

import { useState, useCallback } from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'
import { formatDateToLocal } from '@/lib/date-utils'

// ==================================================
// Cores e Variáveis
// ==================================================
const primaryColor = '#059669'
const textColor = '#1e293b'
const mutedColor = '#64748b'
const borderColor = '#e2e8f0'
const bgColor = '#f8fafc'

// ==================================================
// Estilos do PDF
// ==================================================
const styles = StyleSheet.create({
    page: {
        padding: 40,
        paddingBottom: 100,
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

    // ── OS Badge ──
    osBadge: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: bgColor,
        padding: 10,
        borderWidth: 1,
        borderColor: borderColor,
        marginBottom: 16,
    },
    osBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: textColor,
    },
    osBadgeDate: {
        fontSize: 9,
        color: mutedColor,
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

    // ── Diagnosis Box ──
    diagnosisBox: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: borderColor,
        padding: 10,
        marginBottom: 10,
    },
    diagnosisText: {
        fontSize: 9,
        lineHeight: 1.4,
        color: textColor,
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
        backgroundColor: primaryColor,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    tableHeaderCell: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#ffffff',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
    },
    tableRowAlt: {
        backgroundColor: bgColor,
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    tableCell: {
        fontSize: 8.5,
        color: textColor,
    },
    colDesc: { flex: 4 },
    colUnit: { flex: 2, textAlign: 'right' },
    colQty: { flex: 1, textAlign: 'center' },
    colTotal: { flex: 2, textAlign: 'right' },

    // ── Totals ──
    totalsContainer: {
        marginTop: 8,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '50%',
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    totalLabel: {
        flex: 1,
        fontSize: 9,
        color: mutedColor,
        textAlign: 'right',
        marginRight: 12,
    },
    totalValue: {
        width: 100,
        fontSize: 9,
        color: textColor,
        textAlign: 'right',
    },
    totalDivider: {
        width: '50%',
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        alignSelf: 'flex-end',
        marginVertical: 2,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '50%',
        paddingVertical: 5,
        paddingHorizontal: 8,
        backgroundColor: primaryColor,
    },
    grandTotalLabel: {
        flex: 1,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'right',
        marginRight: 12,
    },
    grandTotalValue: {
        width: 100,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'right',
    },

    // ── Parts Info ──
    partsInfoBox: {
        backgroundColor: '#fffbeb',
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginTop: 10,
    },
    partsInfoText: {
        fontSize: 7,
        color: '#b45309',
        lineHeight: 1.3,
    },

    // ── Observations ──
    observationsBox: {
        borderWidth: 1,
        borderColor: borderColor,
        padding: 10,
        marginTop: 14,
    },
    observationsTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: textColor,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    observationsText: {
        fontSize: 7.5,
        color: mutedColor,
        lineHeight: 1.4,
        marginBottom: 2,
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
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 6,
        color: '#94a3b8',
    },
    warrantyBadge: {
        backgroundColor: '#ecfdf5',
        borderWidth: 1,
        borderColor: '#a7f3d0',
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    warrantyText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#047857',
    },
})

// ==================================================
// Tipo de dados da Loja (Settings)
// ==================================================
interface BudgetStoreSettings {
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
// Tipo de dados do Orçamento
// ==================================================
interface BudgetData {
    displayId: string | number
    createdAt: string
    customerName: string
    customerPhone: string
    customerDocument?: string | null
    equipmentType: string
    equipmentBrand: string
    equipmentModel: string
    equipmentSerial?: string | null
    diagnosisText: string
    laborCost: number
    discountAmount: number
    externalParts: Array<{ name: string; purchaseUrl?: string; price?: number }>
    partsSourcingMode?: PartsSourcingMode
}

// ==================================================
// Auxiliares
// ==================================================
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatAddress(address?: BudgetStoreSettings['address']): string {
    if (!address) return ''
    return [address.street, address.number, address.neighborhood, address.city, address.state].filter(Boolean).join(', ')
}

// ==================================================
// Componente PDF — Orçamento Técnico
// ==================================================
function BudgetDocument({ data, settings }: { data: BudgetData; settings: BudgetStoreSettings }) {
    const osNumber = String(data.displayId).padStart(4, '0')
    const budgetDate = formatDateToLocal(data.createdAt, 'dd/MM/yyyy')
    const warrantyDays = settings.warranty_days_labor || 180
    const mode = data.partsSourcingMode || 'assisted'
    const partsCost = data.externalParts.reduce((sum, p) => sum + (p.price || 0), 0)
    const subtotal = mode === 'resale' ? data.laborCost + partsCost : data.laborCost
    const total = subtotal - data.discountAmount

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
                        <Text style={styles.documentTitle}>Orçamento Técnico</Text>
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

                {/* ── OS BADGE ── */}
                <View style={styles.osBadge}>
                    <Text style={styles.osBadgeText}>OS: #{osNumber}</Text>
                    <Text style={styles.osBadgeDate}>Data: {budgetDate}</Text>
                </View>

                {/* ── DADOS CLIENTE + EQUIPAMENTO ── */}
                <View style={[styles.grid2Col, styles.section]}>
                    <View style={styles.col}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Cliente:</Text>
                            <Text style={styles.value}>{data.customerName}</Text>
                        </View>
                        {data.customerDocument && (
                            <View style={styles.row}>
                                <Text style={styles.label}>CPF/CNPJ:</Text>
                                <Text style={styles.value}>{data.customerDocument}</Text>
                            </View>
                        )}
                        <View style={styles.row}>
                            <Text style={styles.label}>Telefone:</Text>
                            <Text style={styles.value}>{data.customerPhone}</Text>
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

                {/* ── DIAGNÓSTICO TÉCNICO ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Diagnóstico Técnico</Text>
                    </View>
                    <View style={styles.diagnosisBox}>
                        <Text style={styles.diagnosisText}>
                            {data.diagnosisText || 'Diagnóstico pendente.'}
                        </Text>
                    </View>
                </View>

                {/* ── TABELA DE SERVIÇOS ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Serviços</Text>
                    </View>
                    <View style={styles.table}>
                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descrição</Text>
                            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Valor Unit.</Text>
                            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qtd</Text>
                            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
                        </View>

                        {/* Mão de Obra */}
                        <View style={[styles.tableRow, (mode !== 'resale' || data.externalParts.length === 0) ? styles.tableRowLast : {}]}>
                            <Text style={[styles.tableCell, styles.colDesc]}>Mão de Obra Técnica</Text>
                            <Text style={[styles.tableCell, styles.colUnit]}>{formatCurrency(data.laborCost)}</Text>
                            <Text style={[styles.tableCell, styles.colQty]}>1</Text>
                            <Text style={[styles.tableCell, styles.colTotal, { fontWeight: 'bold' }]}>{formatCurrency(data.laborCost)}</Text>
                        </View>

                        {/* Peças na tabela (modo Revenda) */}
                        {mode === 'resale' && data.externalParts.map((part, index) => (
                            <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowAlt : {}, index === data.externalParts.length - 1 ? styles.tableRowLast : {}]}>
                                <Text style={[styles.tableCell, styles.colDesc]}>Peça: {part.name}</Text>
                                <Text style={[styles.tableCell, styles.colUnit]}>{formatCurrency(part.price || 0)}</Text>
                                <Text style={[styles.tableCell, styles.colQty]}>1</Text>
                                <Text style={[styles.tableCell, styles.colTotal, { fontWeight: 'bold' }]}>{formatCurrency(part.price || 0)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Totais */}
                    <View style={styles.totalsContainer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
                        </View>

                        {data.discountAmount > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: '#059669' }]}>Desconto:</Text>
                                <Text style={[styles.totalValue, { color: '#059669' }]}>-{formatCurrency(data.discountAmount)}</Text>
                            </View>
                        )}

                        <View style={styles.totalDivider} />

                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Total:</Text>
                            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
                        </View>
                    </View>
                </View>

                {/* ── PEÇAS EXTERNAS (Compra Assistida ou Link Pagamento Peça) ── */}
                {data.externalParts.length > 0 && mode !== 'resale' && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            {mode === 'assisted' ? 'Peças — Compra Assistida' : 'Peças — Link de Pagamento da Peça'}
                        </View>
                        <View style={styles.table}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Peça</Text>
                                {mode === 'payment_link' && (
                                    <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Valor</Text>
                                )}
                                <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>
                                    {mode === 'assisted' ? 'Link de Compra' : 'Link de Pagamento'}
                                </Text>
                            </View>
                            {data.externalParts.map((part, index) => (
                                <View key={index} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}, index === data.externalParts.length - 1 ? styles.tableRowLast : {}]}>
                                    <Text style={[styles.tableCell, { flex: 3 }]}>{part.name}</Text>
                                    {mode === 'payment_link' && (
                                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{formatCurrency(part.price || 0)}</Text>
                                    )}
                                    <Text style={[styles.tableCell, { flex: 2, textAlign: 'right', fontSize: 7, color: mutedColor }]}>
                                        {part.purchaseUrl ? 'Ver no link enviado' : '—'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.partsInfoBox}>
                            <Text style={styles.partsInfoText}>
                                {mode === 'assisted'
                                    ? 'As peças listadas acima são de fornecedores externos e devem ser adquiridas diretamente pelo cliente nos links indicados. O valor das peças não está incluso no total deste orçamento.'
                                    : 'As peças listadas acima devem ser pagas pelo cliente através dos links de pagamento indicados. Os valores são referentes às peças e serão cobrados separadamente.'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── OBSERVAÇÕES ── */}
                <View style={styles.observationsBox}>
                    <Text style={styles.observationsTitle}>Observações</Text>
                    <Text style={styles.observationsText}>• Prazo estimado de execução: a combinar após aprovação.</Text>
                    <Text style={styles.observationsText}>• Validade deste orçamento: 7 (sete) dias corridos.</Text>
                    {mode === 'assisted' && (
                        <Text style={styles.observationsText}>• O valor das peças (se houver) será pago diretamente pelo cliente nos links indicados.</Text>
                    )}
                    {mode === 'resale' && (
                        <Text style={styles.observationsText}>• O valor total inclui peças fornecidas pelo técnico e mão de obra.</Text>
                    )}
                    {mode === 'payment_link' && (
                        <Text style={styles.observationsText}>• As peças serão pagas separadamente pelo cliente através do link de pagamento enviado.</Text>
                    )}
                    <Text style={styles.observationsText}>• Garantia sobre a mão de obra: {warrantyDays} dias após a conclusão do serviço.</Text>
                </View>

                {/* ── FOOTER ── */}
                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>
                            Documento gerado digitalmente em {formatDateToLocal(new Date().toISOString(), "dd/MM/yyyy 'às' HH:mm")}
                        </Text>
                        <View style={styles.warrantyBadge}>
                            <Text style={styles.warrantyText}>Garantia: {warrantyDays} dias</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
}

// ==================================================
// Botão de Download
// ==================================================
interface BudgetPdfButtonProps {
    budgetData: BudgetData
    storeSettings: BudgetStoreSettings
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    icon?: React.ReactNode
}

export default function BudgetPdfButton({ budgetData, storeSettings, className, variant = "outline", icon }: BudgetPdfButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const osNumber = String(budgetData.displayId).padStart(4, '0')
    const storeName = storeSettings.trade_name.replace(/\s+/g, '_').toUpperCase()
    const fileName = `${storeName}_OS_${osNumber}_Orcamento.pdf`

    const handleDownload = useCallback(async () => {
        setIsGenerating(true)
        try {
            const blob = await pdf(
                <BudgetDocument data={budgetData} settings={storeSettings} />
            ).toBlob()

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Erro ao gerar PDF de orçamento:', error)
        } finally {
            setIsGenerating(false)
        }
    }, [budgetData, storeSettings, fileName])

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
                    {icon ? icon : <FileText className="mr-2 h-4 w-4" />}
                    {!icon && "Baixar Orçamento PDF"}
                </>
            )}
        </Button>
    )
}

export type { BudgetData, BudgetStoreSettings }
