'use client'

import { useState } from 'react'
import { generateBudget, type BudgetSuggestion } from '@/actions/generate-budget'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wand2, CheckCircle2, AlertTriangle } from 'lucide-react'

interface AIBudgetAssistantProps {
    onApply?: (suggestion: BudgetSuggestion) => void
}

export function AIBudgetAssistant({ onApply }: AIBudgetAssistantProps) {
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [suggestion, setSuggestion] = useState<BudgetSuggestion | null>(null)
    const [error, setError] = useState('')

    const handleGenerate = async () => {
        if (!description.trim()) return

        setLoading(true)
        setError('')
        setSuggestion(null)

        try {
            const result = await generateBudget(description)

            if (result.success && result.data) {
                setSuggestion(result.data)
            } else {
                setError(result.error || 'Erro desconhecido ao gerar orçamento.')
            }
        } catch (err) {
            setError('Falha na comunicação com a IA.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full border-dashed border-2 bg-muted/20">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Wand2 className="h-5 w-5 text-purple-600" />
                    Assistente de Orçamento (IA)
                </CardTitle>
                <CardDescription>
                    Descreva o problema do equipamento e a IA sugerirá o serviço ideal e o preço calculado.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Ex: PC Gamer não liga, muito pó nos coolers, cliente relatou cheiro de queimado..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                    disabled={loading}
                />

                <Button
                    onClick={handleGenerate}
                    disabled={loading || description.length < 5}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analisando com VDI...
                        </>
                    ) : (
                        'Gerar Orçamento com IA'
                    )}
                </Button>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {suggestion && (
                    <div className="rounded-lg border bg-background p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-lg">{suggestion.commercial_description}</h4>
                            <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">
                                Sugestão VDI
                            </Badge>
                        </div>

                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-3xl font-bold tracking-tighter">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestion.suggested_price)}
                            </span>
                        </div>

                        <p className="text-xs text-muted-foreground mb-4 italic">
                            "{suggestion.difficulty_reasoning}"
                        </p>

                        <Button
                            variant="outline"
                            className="w-full border-green-200 hover:bg-green-50 hover:text-green-700"
                            onClick={() => {
                                if (onApply) {
                                    onApply(suggestion)
                                } else {
                                    navigator.clipboard.writeText(
                                        `Serviço: ${suggestion.commercial_description}\nPreço: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestion.suggested_price)}\nJustificativa: ${suggestion.difficulty_reasoning}`
                                    )
                                    alert('Sugestão copiada para a área de transferência! 📋')
                                }
                            }}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {onApply ? 'Aplicar este Orçamento' : 'Copiar Sugestão'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
