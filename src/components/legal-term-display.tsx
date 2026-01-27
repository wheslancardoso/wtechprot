'use client'

import { useState } from 'react'
import { LEGAL_TERMS, type LegalTermType } from '@/lib/legal-terms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, FileText, Scale } from 'lucide-react'

// ==================================================
// Props
// ==================================================
interface LegalTermDisplayProps {
    type: LegalTermType
    onAccept?: (accepted: boolean) => void
    showCheckbox?: boolean
    accepted?: boolean
    compact?: boolean
}

// ==================================================
// Component
// ==================================================
export function LegalTermDisplay({
    type,
    onAccept,
    showCheckbox = false,
    accepted = false,
    compact = false,
}: LegalTermDisplayProps) {
    const term = LEGAL_TERMS[type]

    if (compact) {
        return (
            <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Scale className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>{term.content.split('\n')[0]}</p>
                </div>
                {showCheckbox && (
                    <div className="flex items-start space-x-3 py-2">
                        <Checkbox
                            id={`accept-${type}`}
                            checked={accepted}
                            onCheckedChange={(checked) => onAccept?.(checked === true)}
                        />
                        <Label
                            htmlFor={`accept-${type}`}
                            className="text-sm font-medium leading-snug cursor-pointer"
                        >
                            Li e aceito os termos acima
                        </Label>
                    </div>
                )}
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    {term.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <ScrollArea className="h-48 rounded-md border p-4">
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                        {term.content}
                    </div>
                </ScrollArea>

                {showCheckbox && (
                    <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Checkbox
                            id={`accept-${type}`}
                            checked={accepted}
                            onCheckedChange={(checked) => onAccept?.(checked === true)}
                            className="mt-0.5"
                        />
                        <div>
                            <Label
                                htmlFor={`accept-${type}`}
                                className="text-sm font-medium cursor-pointer"
                            >
                                Li e concordo com os termos acima
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Ao marcar esta caixa, você declara ter lido e compreendido os termos.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ==================================================
// Multiple Terms Display
// ==================================================
interface LegalTermsGroupProps {
    types: LegalTermType[]
    onAllAccepted?: (allAccepted: boolean) => void
}

export function LegalTermsGroup({ types, onAllAccepted }: LegalTermsGroupProps) {
    const [acceptedTerms, setAcceptedTerms] = useState<Record<string, boolean>>({})

    function handleAccept(type: LegalTermType, accepted: boolean) {
        const newAccepted = { ...acceptedTerms, [type]: accepted }
        setAcceptedTerms(newAccepted)

        const allAccepted = types.every((t) => newAccepted[t] === true)
        onAllAccepted?.(allAccepted)
    }

    return (
        <div className="space-y-4">
            {types.map((type) => (
                <LegalTermDisplay
                    key={type}
                    type={type}
                    showCheckbox
                    accepted={acceptedTerms[type] || false}
                    onAccept={(accepted) => handleAccept(type, accepted)}
                />
            ))}
        </div>
    )
}

// ==================================================
// Simple Text (para PDF)
// ==================================================
export function getLegalTermText(type: LegalTermType): string {
    return LEGAL_TERMS[type].content
}
