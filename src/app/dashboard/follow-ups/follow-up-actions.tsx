'use client'

import { useState } from 'react'
import { MessageSquare, Check, SkipForward, MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { completeFollowUp, skipFollowUp } from './actions'
import { generateWhatsAppLink, templatePosVendaPasso1, templatePosVendaPasso2, templatePosVendaPasso3, templatePosVendaPasso4 } from '@/lib/whatsapp-templates'
import { useSettings } from '@/components/settings-provider'

interface FollowUpActionsProps {
    followUpId: string | null
    orderId: string
    displayId: number
    customerName: string
    customerPhone: string
    deviceType: string | null
    type: 'step1_blindage' | 'step2_social_proof' | 'step3_authority' | 'step4_new_sale' | 'manual'
    daysRemaining?: number
    warrantyEndDate?: string | null
}

export function FollowUpActions({
    followUpId,
    orderId,
    displayId,
    customerName,
    customerPhone,
    deviceType,
    type,
    daysRemaining = 7,
    warrantyEndDate
}: FollowUpActionsProps) {
    const { settings } = useSettings()
    const [isCompleting, setIsCompleting] = useState(false)
    const [showNotesDialog, setShowNotesDialog] = useState(false)
    const [notes, setNotes] = useState('')
    const [action, setAction] = useState<'complete' | 'skip'>('complete')


    // Generate WhatsApp message based on type
    function getWhatsAppLink() {
        if (!settings) return '#'

        let message = ''

        if (type === 'step1_blindage') {
            message = templatePosVendaPasso1(customerName, displayId, settings)
        } else if (type === 'step2_social_proof') {
            message = templatePosVendaPasso2(customerName)
        } else if (type === 'step3_authority') {
            message = templatePosVendaPasso3(customerName)
        } else if (type === 'step4_new_sale') {
            message = templatePosVendaPasso4(customerName, warrantyEndDate || new Date())
        } else {
            // Fallback
            message = `Olá! Tudo bem?`
        }

        return generateWhatsAppLink(customerPhone, message)
    }

    async function handleComplete() {
        if (!followUpId) return

        setIsCompleting(true)
        await completeFollowUp(followUpId, notes)
        setIsCompleting(false)
        setShowNotesDialog(false)
        setNotes('')
    }

    async function handleSkip() {
        if (!followUpId) return

        setIsCompleting(true)
        await skipFollowUp(followUpId, notes)
        setIsCompleting(false)
        setShowNotesDialog(false)
        setNotes('')
    }

    function openNotesDialog(actionType: 'complete' | 'skip') {
        setAction(actionType)
        setShowNotesDialog(true)
    }

    return (
        <>
            <div className="flex items-center gap-1">
                {/* WhatsApp Button */}
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 shrink-0"
                    asChild
                >
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                </Button>

                {/* Actions Dropdown */}
                {followUpId && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openNotesDialog('complete')}>
                                <Check className="h-4 w-4 mr-2" />
                                Marcar como feito
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => openNotesDialog('skip')}
                                className="text-muted-foreground"
                            >
                                <SkipForward className="h-4 w-4 mr-2" />
                                Pular
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Notes Dialog */}
            <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {action === 'complete' ? 'Marcar como feito' : 'Pular follow-up'}
                        </DialogTitle>
                        <DialogDescription>
                            {action === 'complete'
                                ? 'Adicione uma nota sobre o contato (opcional).'
                                : 'Por que está pulando este follow-up?'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        placeholder={action === 'complete'
                            ? 'Ex: Cliente confirmou que está tudo funcionando.'
                            : 'Ex: Cliente não atendeu.'
                        }
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={action === 'complete' ? handleComplete : handleSkip}
                            disabled={isCompleting}
                            variant={action === 'complete' ? 'default' : 'secondary'}
                        >
                            {isCompleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {action === 'complete' ? 'Confirmar' : 'Pular'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
