'use client'

import React, { useState, useTransition, useEffect } from 'react'
import {
    toggleExecutionTask,
    addExecutionTask,
    applyTaskPreset,
    removeExecutionTask,
    getPresets,
    savePreset,
    deletePreset,
    renamePreset,
    getExecutionTasks,
} from '@/lib/execution-tasks-actions'
import type { ExecutionTask, TaskPreset } from '@/lib/execution-tasks-types'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

// Icons
import {
    Plus,
    ListChecks,
    Sparkles,
    Trash2,
    Loader2,
    CheckCircle2,
    Circle,
    Save,
    X,
    Pencil,
    ChevronRight,
    Settings2,
    Eye,
    Check,
    AlertTriangle,
} from 'lucide-react'

// ==================================================
// Props
// ==================================================
interface ExecutionChecklistProps {
    orderId: string
    initialTasks: ExecutionTask[]
    isEditable?: boolean
}

// ==================================================
// Component
// ==================================================
export default function ExecutionChecklist({
    orderId,
    initialTasks,
    isEditable = true,
}: ExecutionChecklistProps) {
    const [tasks, setTasks] = useState<ExecutionTask[]>(initialTasks)
    const [newTaskLabel, setNewTaskLabel] = useState('')
    const [isPending, startTransition] = useTransition()

    // Presets State
    const [showPresets, setShowPresets] = useState(false)
    const [availablePresets, setAvailablePresets] = useState<TaskPreset[]>([])
    const [presetsLoading, setPresetsLoading] = useState(false)

    // Preset Management State
    const [managingPresets, setManagingPresets] = useState(false)
    const [editingPresetId, setEditingPresetId] = useState<string | null>(null)
    const [editingPresetName, setEditingPresetName] = useState('')
    const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null)
    const [previewingPresetId, setPreviewingPresetId] = useState<string | null>(null)

    // Save Preset State
    const [showSavePreset, setShowSavePreset] = useState(false)
    const [newPresetName, setNewPresetName] = useState('')

    const { toast } = useToast()

    // Calcular progresso
    const completedCount = tasks.filter((t) => t.completed).length
    const totalCount = tasks.length
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    // Load Presets
    const loadPresets = React.useCallback(async () => {
        setPresetsLoading(true)
        const result = await getPresets()
        if (result.success && result.data) {
            setAvailablePresets(result.data)
        }
        setPresetsLoading(false)
    }, [])

    useEffect(() => {
        if (showPresets && availablePresets.length === 0) {
            loadPresets()
        }
    }, [showPresets, availablePresets.length, loadPresets])

    // Load Tasks on Mount (Ensure Freshness)
    useEffect(() => {
        const loadFreshTasks = async () => {
            const result = await getExecutionTasks(orderId)
            if (result.success && result.data) {
                setTasks(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(result.data)) return prev
                    return result.data!
                })
            }
        }
        loadFreshTasks()
    }, [orderId])

    // Toggle task
    async function handleToggle(taskId: string, currentCompleted: boolean) {
        const newCompleted = !currentCompleted

        // Optimistic update
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? { ...task, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
                    : task
            )
        )

        startTransition(async () => {
            await toggleExecutionTask(orderId, taskId, newCompleted)
        })
    }

    // Add task
    async function handleAddTask() {
        if (!newTaskLabel.trim()) return

        const result = await addExecutionTask(orderId, newTaskLabel.trim())

        if (result.success && result.task) {
            setTasks((prev) => [...prev, result.task!])
            setNewTaskLabel('')
        } else {
            toast({
                title: 'Erro',
                description: result.message || 'Falha ao adicionar tarefa',
                variant: 'destructive'
            })
        }
    }

    // Apply preset
    async function handleApplyPreset(presetTasks: string[]) {
        setShowPresets(false)
        setManagingPresets(false)
        const result = await applyTaskPreset(orderId, presetTasks)

        if (result.success) {
            const freshResult = await getExecutionTasks(orderId)
            if (freshResult.success && freshResult.data) {
                setTasks(freshResult.data)
            }
            toast({
                title: 'Preset aplicado!',
                description: `${presetTasks.length} tarefas adicionadas ao checklist.`,
            })
        } else {
            toast({
                title: 'Erro',
                description: result.message || 'Falha ao aplicar preset',
                variant: 'destructive'
            })
        }
    }

    // Save current tasks as preset
    async function handleSavePreset() {
        if (!newPresetName.trim() || tasks.length === 0) return

        const taskTitles = tasks.map(t => t.title || (t as any).label)
        const result = await savePreset(newPresetName.trim(), taskTitles)

        if (result.success) {
            toast({ title: 'Sucesso', description: 'Preset salvo com sucesso!' })
            setShowSavePreset(false)
            setNewPresetName('')
            setAvailablePresets([])
        } else {
            toast({ title: 'Erro', description: result.message, variant: 'destructive' })
        }
    }

    // Delete preset
    async function handleDeletePreset(id: string) {
        const result = await deletePreset(id)
        if (result.success) {
            setAvailablePresets(prev => prev.filter(p => p.id !== id))
            setDeletingPresetId(null)
            toast({ title: 'Preset removido' })
        } else {
            toast({ title: 'Erro', description: result.message, variant: 'destructive' })
        }
    }

    // Rename preset
    async function handleRenamePreset(id: string) {
        if (!editingPresetName.trim()) return
        const result = await renamePreset(id, editingPresetName.trim())
        if (result.success) {
            setAvailablePresets(prev =>
                prev.map(p => p.id === id ? { ...p, name: editingPresetName.trim() } : p)
            )
            setEditingPresetId(null)
            setEditingPresetName('')
            toast({ title: 'Preset renomeado!' })
        } else {
            toast({ title: 'Erro', description: result.message, variant: 'destructive' })
        }
    }

    // Remove task
    async function handleRemoveTask(taskId: string) {
        const result = await removeExecutionTask(orderId, taskId)
        if (result.success) {
            setTasks((prev) => prev.filter((t) => t.id !== taskId))
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ListChecks className="h-5 w-5" />
                            Andamento do Serviço
                        </CardTitle>
                        <CardDescription>
                            {completedCount} de {totalCount} etapas concluídas
                        </CardDescription>
                    </div>

                    {isEditable && (
                        <div className="flex gap-2">
                            {/* Save Preset Button */}
                            {tasks.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSavePreset(!showSavePreset)}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Lista
                                </Button>
                            )}

                            {/* Load/Manage Presets Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowPresets(!showPresets)
                                    setManagingPresets(false)
                                    setEditingPresetId(null)
                                    setDeletingPresetId(null)
                                    setPreviewingPresetId(null)
                                }}
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Presets
                            </Button>
                        </div>
                    )}
                </div>

                {/* Save Preset Form */}
                {showSavePreset && (
                    <div className="flex gap-2 items-center p-2 bg-muted rounded-md mt-2 animate-in slide-in-from-top-2">
                        <Input
                            placeholder="Nome do novo preset..."
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                            className="h-8"
                        />
                        <Button size="sm" onClick={handleSavePreset} disabled={!newPresetName.trim()}>
                            Salvar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowSavePreset(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Presets Panel */}
                {showPresets && (
                    <div className="mt-3 border rounded-lg bg-popover shadow-sm animate-in slide-in-from-top-2 duration-200">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50 rounded-t-lg">
                            <span className="text-sm font-medium">
                                {managingPresets ? 'Gerenciar Presets' : 'Selecionar Preset'}
                            </span>
                            <div className="flex items-center gap-1">
                                {!managingPresets && availablePresets.some(p => p.user_id !== 'system') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                            setManagingPresets(true)
                                            setEditingPresetId(null)
                                            setDeletingPresetId(null)
                                        }}
                                    >
                                        <Settings2 className="h-3.5 w-3.5 mr-1" />
                                        Gerenciar
                                    </Button>
                                )}
                                {managingPresets && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                            setManagingPresets(false)
                                            setEditingPresetId(null)
                                            setDeletingPresetId(null)
                                        }}
                                    >
                                        Voltar
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setShowPresets(false)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Panel Content */}
                        <div className="max-h-[350px] overflow-y-auto p-1">
                            {presetsLoading ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                                    Carregando presets...
                                </div>
                            ) : availablePresets.length === 0 ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    Nenhum preset salvo ainda.
                                    <p className="text-xs mt-1">
                                        Adicione etapas e clique em &quot;Salvar Lista&quot; para criar um preset.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    {availablePresets.map((preset) => (
                                        <div key={preset.id}>
                                            {/* Confirmação de exclusão */}
                                            {deletingPresetId === preset.id ? (
                                                <div className="mx-1 p-2.5 rounded-md bg-destructive/10 border border-destructive/20 animate-in fade-in duration-200">
                                                    <div className="flex items-center gap-2 mb-2 text-sm">
                                                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                                        <span>
                                                            Excluir <strong>&quot;{preset.name}&quot;</strong>?
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={() => setDeletingPresetId(null)}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={() => handleDeletePreset(preset.id)}
                                                        >
                                                            Confirmar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : editingPresetId === preset.id ? (
                                                /* Formulário de renomeação inline */
                                                <div className="mx-1 p-2 rounded-md bg-muted/80 animate-in fade-in duration-200">
                                                    <div className="flex gap-2 items-center">
                                                        <Input
                                                            value={editingPresetName}
                                                            onChange={(e) => setEditingPresetName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleRenamePreset(preset.id)
                                                                if (e.key === 'Escape') setEditingPresetId(null)
                                                            }}
                                                            className="h-7 text-sm"
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="h-7 w-7 p-0 shrink-0"
                                                            onClick={() => handleRenamePreset(preset.id)}
                                                            disabled={!editingPresetName.trim()}
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 shrink-0"
                                                            onClick={() => setEditingPresetId(null)}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Linha normal do preset */
                                                <div className="group">
                                                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
                                                        {managingPresets ? (
                                                            /* Modo gerenciamento */
                                                            <>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{preset.name}</p>
                                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        {preset.tasks.length} etapas
                                                                        {preset.user_id === 'system' && (
                                                                            <Badge variant="secondary" className="ml-2 text-[10px] px-1 py-0">
                                                                                padrão
                                                                            </Badge>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-0.5 shrink-0">
                                                                    {/* Preview */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                                        onClick={() => setPreviewingPresetId(
                                                                            previewingPresetId === preset.id ? null : preset.id
                                                                        )}
                                                                        title="Ver etapas"
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    {preset.user_id !== 'system' && (
                                                                        <>
                                                                            {/* Rename */}
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                                                onClick={() => {
                                                                                    setEditingPresetId(preset.id)
                                                                                    setEditingPresetName(preset.name)
                                                                                }}
                                                                                title="Renomear"
                                                                            >
                                                                                <Pencil className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                            {/* Delete */}
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                                                onClick={() => setDeletingPresetId(preset.id)}
                                                                                title="Excluir"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            /* Modo seleção */
                                                            <button
                                                                className="flex items-center gap-2 flex-1 text-left"
                                                                onClick={() => handleApplyPreset(preset.tasks)}
                                                            >
                                                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="text-sm truncate block">{preset.name}</span>
                                                                </div>
                                                                <Badge variant="secondary" className="text-[10px] shrink-0">
                                                                    {preset.tasks.length}
                                                                </Badge>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Preview das tarefas (expandível) */}
                                                    {previewingPresetId === preset.id && (
                                                        <div className="mx-2 mb-1 p-2 rounded bg-muted/50 border text-xs space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                                                            {preset.tasks.map((task, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
                                                                    <Circle className="h-2.5 w-2.5 shrink-0" />
                                                                    <span className="truncate">{task}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {totalCount > 0 && (
                    <Progress value={progress} className="h-2 mt-4" />
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Lista de Tarefas */}
                {tasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                        Nenhuma etapa cadastrada.
                        {isEditable && ' Adicione uma ou carregue um preset.'}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${task.completed
                                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                                    : 'bg-background border-border hover:bg-muted/50'
                                    }`}
                            >
                                {isEditable ? (
                                    <button
                                        onClick={() => handleToggle(task.id, task.completed)}
                                        disabled={isPending}
                                        className="shrink-0"
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                        )}
                                    </button>
                                ) : task.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                )}

                                <span
                                    className={`flex-1 ${task.completed ? 'text-green-700 dark:text-green-300 line-through' : ''
                                        }`}
                                >
                                    {task.title || (task as any).label}
                                </span>

                                {isEditable && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveTask(task.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Adicionar Tarefa */}
                {isEditable && (
                    <div className="flex gap-2 pt-4 border-t">
                        <Input
                            placeholder="Nova etapa..."
                            value={newTaskLabel}
                            onChange={(e) => setNewTaskLabel(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        />
                        <Button onClick={handleAddTask} disabled={!newTaskLabel.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Loading indicator */}
                {isPending && (
                    <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
