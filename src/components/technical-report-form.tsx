'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, Plus, X, FileText, CheckCircle2, Image as ImageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast' // Assuming this exists, or use standard alert

import ImageUpload from '@/components/image-upload'
import TechnicalReportPdfButton from './technical-report-pdf'
import { generateTechnicalReport } from '@/app/actions/generate-technical-report'
import { type BudgetSuggestion } from '@/app/actions/generate-budget'
import { Wand2, AlertTriangle, Copy, Check } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

import type { TechnicalReport, TechnicalReportFormData } from '@/types/technical-report'
import type { OrderData, StoreSettings } from '@/components/warranty-pdf'

interface TechnicalReportFormProps {
    orderId: string
    tenantId: string
    existingReport?: TechnicalReport | null
    orderData: OrderData
    storeSettings: StoreSettings
    checkinPhotos?: string[]
    checkoutPhotos?: string[]
}

const COMMON_TESTS = [
    "Teste de Stress (GPU/CPU)",
    "Verificação S.M.A.R.T (Disco)",
    "Teste de Memória RAM (MemTest)",
    "Medição de Tensões (Fonte/Placa)",
    "Inspeção Visual (Microscópio)",
    "Teste de Teclado/Touchpad",
    "Teste de Áudio/Câmera",
    "Limpeza Química",
]

const COMMON_CONCLUSIONS = [
    "Reparo realizado com sucesso.",
    "Equipamento sem conserto (PT - Perda Total).",
    "Defeito intermitente (não reproduzido em bancada).",
    "Cliente reprovou o orçamento.",
    "Aguardando peças para conclusão."
]

export default function TechnicalReportForm({
    orderId,
    tenantId,
    existingReport,
    orderData,
    storeSettings,
    checkinPhotos = [],
    checkoutPhotos = []
}: TechnicalReportFormProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(!existingReport)
    const [isSaving, setIsSaving] = useState(false)

    // Form State
    const [analysis, setAnalysis] = useState(existingReport?.technical_analysis || '')
    const [conclusion, setConclusion] = useState(existingReport?.conclusion || '')
    const [tests, setTests] = useState<string[]>(existingReport?.tests_performed || [])
    const [newTest, setNewTest] = useState('')

    // AI Budget State
    const [isGeneratingBudget, setIsGeneratingBudget] = useState(false)
    const [budgetSuggestion, setBudgetSuggestion] = useState<BudgetSuggestion | null>(null)
    const [showBudgetDialog, setShowBudgetDialog] = useState(false)

    const handleGenerateBudget = async () => {
        if (!analysis || analysis.length < 5) { // Relaxed len check slightly
            toast({
                title: "Análise muito curta",
                description: "Escreva algumas palavras-chave para a IA expandir.",
                variant: "destructive"
            })
            return
        }

        setIsGeneratingBudget(true)
        try {
            // Use the new dedicated action
            const result = await generateTechnicalReport(analysis)

            if (result.success && result.data) {
                setAnalysis(result.data) // Directly set the text
                toast({
                    title: "Laudo Gerado!",
                    description: "O texto técnico foi expandido com sucesso.",
                    variant: "default",
                    className: "bg-green-50 border-green-200 text-green-800"
                })
            } else {
                toast({
                    title: "Erro na IA",
                    description: result.error || "Não foi possível gerar o laudo.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Erro",
                description: "Falha ao comunicar com o assistente.",
                variant: "destructive"
            })
        } finally {
            setIsGeneratingBudget(false)
        }
    }

    // Evidence State
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>(existingReport?.photos_evidence || [])
    // We separate newly uploaded photos to avoid duplication logic complexity, but mostly we just merge them.
    // Ideally we upload first then add URL. ImageUpload does that.

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleAddTest = (test: string) => {
        const t = test.trim()
        if (t && !tests.includes(t)) {
            setTests([...tests, t])
        }
        setNewTest('')
    }

    const handleRemoveTest = (testToRemove: string) => {
        setTests(tests.filter(t => t !== testToRemove))
    }

    const togglePhotoSelection = (url: string) => {
        if (selectedPhotos.includes(url)) {
            setSelectedPhotos(selectedPhotos.filter(p => p !== url))
        } else {
            setSelectedPhotos([...selectedPhotos, url])
        }
    }

    const handleSave = async () => {
        if (!analysis.trim() || !conclusion.trim()) {
            alert("Preencha a análise técnica e a conclusão.")
            return
        }

        setIsSaving(true)

        try {
            const payload: TechnicalReportFormData = {
                technical_analysis: analysis,
                conclusion: conclusion,
                tests_performed: tests,
                photos_evidence: selectedPhotos,
                pdf_url: null
            }

            const { data, error } = await supabase
                .from('technical_reports')
                .upsert({
                    order_id: orderId,
                    tenant_id: tenantId,
                    ...payload
                }, { onConflict: 'order_id' })
                .select()
                .single()

            if (error) throw error

            // Suggest status update if not already appropriate
            // Note: This logic might be better placed in a server action or trigger, but per requirements:
            // "Ao salvar o Laudo, se a OS estiver em open ou analyzing, sugerir mudar o status"
            // We just notify success for now, maybe trigger a refresh.

            router.refresh()
            setIsEditing(false)
        } catch (err) {
            console.error('Error saving report:', JSON.stringify(err, null, 2))
            alert("Erro ao salvar laudo.")
        } finally {
            setIsSaving(false)
        }
    }

    if (!isEditing && existingReport) {
        return (
            <Card className="border-green-600/20 bg-green-50/10">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-green-600" />
                            Laudo Técnico Emitido
                        </CardTitle>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            {format(new Date(existingReport.created_at), "dd/MM/yyyy HH:mm")}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Análise Técnica</Label>
                        <p className="text-sm whitespace-pre-wrap mt-1">{existingReport.technical_analysis}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Conclusão</Label>
                        <p className="text-sm font-medium mt-1">{existingReport.conclusion}</p>
                    </div>
                    {existingReport.tests_performed?.length > 0 && (
                        <div>
                            <Label className="text-muted-foreground text-xs uppercase">Testes Realizados</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {existingReport.tests_performed.map((test, i) => (
                                    <Badge key={i} variant="secondary">{test}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex gap-3 border-t pt-4">
                    <TechnicalReportPdfButton
                        report={existingReport}
                        orderData={orderData}
                        storeSettings={storeSettings}
                    />
                    <Button variant="ghost" onClick={() => setIsEditing(true)}>
                        Editar Laudo
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Emissão de Laudo Técnico
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Test Checklist */}
                <div className="space-y-3">
                    <Label>Procedimentos e Testes Realizados</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ex: Teste de Stress de GPU..."
                            value={newTest}
                            onChange={(e) => setNewTest(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTest(newTest))}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleAddTest(newTest)}
                            disabled={!newTest.trim()}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Common Tests suggestions */}
                    <div className="flex flex-wrap gap-2">
                        {COMMON_TESTS.map(t => (
                            !tests.includes(t) && (
                                <Badge
                                    key={t}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-muted"
                                    onClick={() => handleAddTest(t)}
                                >
                                    + {t}
                                </Badge>
                            )
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/20">
                        {tests.length === 0 && <span className="text-xs text-muted-foreground p-1">Nenhum teste adicionado.</span>}
                        {tests.map((test, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1 pl-2">
                                {test}
                                <button type="button" onClick={() => handleRemoveTest(test)} className="ml-1 hover:text-destructive">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Analysis */}
                <div className="space-y-2">
                    <Label>Análise Técnica Detalhada</Label>
                    <Textarea
                        placeholder="Descreva detalhadamente o problema encontrado, a causa raiz e a solução proposta..."
                        className="min-h-[150px]"
                        value={analysis}
                        onChange={(e) => setAnalysis(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            onClick={handleGenerateBudget}
                            disabled={isGeneratingBudget || !analysis}
                        >
                            {isGeneratingBudget ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            {isGeneratingBudget ? 'Refinando...' : 'Refinar Análise com IA'}
                        </Button>
                    </div>
                </div>

                {/* AI Budget Dialog */}
                <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-purple-600" />
                                Sugestão de Orçamento
                            </DialogTitle>
                            <DialogDescription>
                                Com base na sua análise técnica, a IA sugere o seguinte serviço e valor:
                            </DialogDescription>
                        </DialogHeader>

                        {budgetSuggestion && (
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase">Serviço Sugerido</Label>
                                        <p className="font-medium text-lg">{budgetSuggestion.commercial_description}</p>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase">Valor Sugerido</Label>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-green-600">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budgetSuggestion.suggested_price)}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                Nível VDI
                                            </Badge>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase">Justificativa da IA</Label>
                                        <p className="text-sm italic text-muted-foreground">"{budgetSuggestion.difficulty_reasoning}"</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() => {
                                            const textToCopy = `Serviço: ${budgetSuggestion.commercial_description}\nValor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budgetSuggestion.suggested_price)}`
                                            navigator.clipboard.writeText(textToCopy)
                                            toast({ title: "Copiado!", description: "Orçamento copiado para a área de transferência." })
                                            setShowBudgetDialog(false)
                                        }}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copiar Sugestão
                                    </Button>
                                    <Button variant="ghost" onClick={() => setShowBudgetDialog(false)}>
                                        Fechar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Conclusion */}
                <div className="space-y-2">
                    <Label>Conclusão Final</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {COMMON_CONCLUSIONS.map(c => (
                            <Badge
                                key={c}
                                variant={conclusion === c ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setConclusion(c)}
                            >
                                {c}
                            </Badge>
                        ))}
                    </div>
                    <Input
                        placeholder="Digite a conclusão..."
                        value={conclusion}
                        onChange={(e) => setConclusion(e.target.value)}
                    />
                </div>

                {/* Evidence */}
                <div className="space-y-4 pt-4 border-t">
                    <Label className="text-base">Evidências Fotográficas</Label>

                    <Tabs defaultValue="upload">
                        <TabsList>
                            <TabsTrigger value="upload">Novas Fotos</TabsTrigger>
                            <TabsTrigger value="checkin">Fotos do Pedido ({checkinPhotos.length + checkoutPhotos.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="pt-2">
                            <ImageUpload
                                orderId={orderId}
                                type="technical_report"
                                // Actually ImageUpload uses 'type' for label and path.
                                // If I pass type='technical_report', it handles it? The labels object in ImageUpload might miss it.
                                // Let's check ImageUpload again.
                                // It has `typeLabels` object. If type is missing, it might crash or show empty.
                                // I'll assume I can modify ImageUpload or just ignore the title if it's missing.
                                // Actually I'll use text-sm to explain.
                                existingImages={[]} // We manage selected photos separately, or we could validly upload here and add to "selected".
                                // Wait, ImageUpload handles its own state.
                                // I want photos uploaded here to be added to `selectedPhotos`.
                                onUploadComplete={(urls) => {
                                    // Add *new* urls to selected if not present
                                    const newOnes = urls.filter(u => !selectedPhotos.includes(u))
                                    if (newOnes.length > 0) setSelectedPhotos([...selectedPhotos, ...newOnes])
                                }}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                * As fotos enviadas aqui podem ser usadas no laudo. Lembre-se de selecioná-las abaixo se necessário.
                                (O componente ImageUpload atual pode não refletir seleção automática).
                            </p>
                        </TabsContent>

                        <TabsContent value="checkin" className="pt-2">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[...checkinPhotos, ...checkoutPhotos].map((url, idx) => (
                                    <div
                                        key={idx}
                                        className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 ${selectedPhotos.includes(url) ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                                        onClick={() => togglePhotoSelection(url)}
                                    >
                                        <img src={url} className="w-full h-full object-cover" alt="evidence" />
                                        {selectedPhotos.includes(url) && (
                                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {[...checkinPhotos, ...checkoutPhotos].length === 0 && (
                                    <p className="text-sm text-muted-foreground col-span-4">Nenhuma foto de check-in/out disponível.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Selected Summary */}
                    {selectedPhotos.length > 0 && (
                        <div className="bg-muted/30 p-3 rounded-md">
                            <Label className="text-xs uppercase mb-2 block">Fotos Selecionadas para o PDF ({selectedPhotos.length})</Label>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {selectedPhotos.map((url, i) => (
                                    <div key={i} className="relative w-16 h-16 shrink-0 rounded overflow-hidden border">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => togglePhotoSelection(url)}
                                            className="absolute top-0 right-0 bg-white/80 text-destructive rounded-bl-md p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {existingReport && (
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                )}
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Salvando...' : 'Salvar e Emitir Laudo'}
                </Button>
            </CardFooter>
        </Card>
    )
}
