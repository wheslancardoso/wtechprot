'use client'

import { useState, useEffect } from 'react'
import { APPROVAL_TERMS } from '@/lib/constants/legal-terms'
import { Check, ShieldAlert, Database, Clock, Wrench, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface TermsAgreementStepProps {
    hasParts: boolean // Mantido para compatibilidade, mas o prompt pede os 5 termos fixos
    entryChecklist?: any
    onComplete: (acceptedTermsSnapshot: any[]) => void
    onCancel?: () => void
    variant?: 'wizard' | 'inline'
    onChange?: (isValid: boolean, snapshot: any[]) => void
}

export default function TermsAgreementStep({
    hasParts, // Não usado na lógica fixa do prompt mestre, mas mantido na interface
    entryChecklist,
    onComplete,
    onCancel,
    variant = 'wizard',
    onChange
}: TermsAgreementStepProps) {
    const [acceptedIds, setAcceptedIds] = useState<string[]>([])

    // Filtra termos. Se o usuário quiser remover "abandonment" de novo, filtra aqui.
    // O prompt pediu os 5. Vamos exibir os 5.
    const terms = APPROVAL_TERMS
    const totalTerms = terms.length
    const acceptedCount = acceptedIds.length
    const progress = (acceptedCount / totalTerms) * 100
    const allAccepted = acceptedCount === totalTerms

    // Efeito para notificar pai
    useEffect(() => {
        if (variant === 'inline' && onChange) {
            const snapshot = terms
                .filter(t => acceptedIds.includes(t.id))
                .map(t => ({
                    id: t.id,
                    title: t.title,
                    content_hash: 'v1', // Simplificado
                    accepted_at: new Date().toISOString()
                }))

            onChange(allAccepted, allAccepted ? snapshot : [])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [acceptedIds, allAccepted, variant])

    const handleToggle = (id: string) => {
        setAcceptedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        )
    }

    const handleConfirm = () => {
        if (!allAccepted) return

        const snapshot = terms.map(t => ({
            id: t.id,
            title: t.title,
            content: t.content,
            accepted_at: new Date().toISOString()
        }))

        onComplete(snapshot)
    }

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'wrench': return <Wrench className="h-5 w-5 text-orange-500" />
            case 'database': return <Database className="h-5 w-5 text-blue-500" />
            case 'clock': return <Clock className="h-5 w-5 text-purple-500" />
            case 'alert': return <AlertTriangle className="h-5 w-5 text-destructive" />
            case 'file-text': return <FileText className="h-5 w-5 text-emerald-500" />
            default: return <Check className="h-5 w-5" />
        }
    }

    return (
        <div className={cn("space-y-4 animate-in slide-in-from-right-4", variant === 'inline' ? "space-y-2" : "")}>

            {/* Header de Progresso */}
            <div className="bg-muted/30 p-3 rounded-lg border flex items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-md">
                <div className="space-y-1 flex-1">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                        <span>Progresso do Aceite</span>
                        <span className={cn(allAccepted ? "text-green-600 font-bold" : "")}>
                            {acceptedCount} de {totalTerms}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </div>

            <div className={cn(
                "px-1",
                variant === 'wizard' ? "max-h-[60vh] overflow-y-auto pr-2" : "max-h-[50vh] overflow-y-auto pr-2"
            )}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                    {terms.map(term => {
                        const isAccepted = acceptedIds.includes(term.id)
                        return (
                            <div
                                key={term.id}
                                onClick={() => handleToggle(term.id)}
                                className={cn(
                                    "relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group select-none flex flex-col gap-3",
                                    isAccepted
                                        ? "bg-primary/5 border-primary shadow-sm"
                                        : "bg-card border-muted hover:border-primary/50 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                        isAccepted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {isAccepted ? <Check className="h-6 w-6" /> : getIcon(term.icon)}
                                    </div>
                                    <h4 className={cn(
                                        "font-bold text-sm leading-tight flex-1",
                                        isAccepted ? "text-primary" : "text-foreground"
                                    )}>
                                        {term.title}
                                    </h4>
                                    <div className={cn(
                                        "shrink-0 h-6 w-6 rounded-full border-2 transition-colors flex items-center justify-center",
                                        isAccepted
                                            ? "bg-primary border-primary"
                                            : "border-muted-foreground/30 group-hover:border-primary"
                                    )}>
                                        {isAccepted && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed text-justify border-t pt-3 mt-1 border-dashed border-muted-foreground/20">
                                    {term.content}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {variant === 'wizard' && (
                <>
                    <div className="flex justify-between gap-3 pt-2">
                        <Button variant="ghost" onClick={onCancel}>
                            Voltar
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!allAccepted}
                            className="flex-1 bg-primary hover:bg-primary/90"
                        >
                            {allAccepted ? "Concordar e Avançar" : `Aceite os ${totalTerms - acceptedCount} restantes`}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
