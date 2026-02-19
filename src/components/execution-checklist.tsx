'use client'

import { useState, useTransition, useEffect } from 'react'
import {
    toggleExecutionTask,
    addExecutionTask,
    applyTaskPreset,
    removeExecutionTask,
    getPresets,
    savePreset,
    deletePreset,
    getExecutionTasks,
} from '@/lib/execution-tasks-actions'
import type { ExecutionTask, TaskPreset } from '@/lib/execution-tasks-types'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

// Icons
import {
    Plus,
    ListChecks,
    Sparkles,
    Trash2,
    Loader2,
    CheckCircle2,
    Circle,
    ChevronDown,
    Save,
    X,
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

    // Save Preset State
    const [showSavePreset, setShowSavePreset] = useState(false)
    const [newPresetName, setNewPresetName] = useState('')

    const { toast } = useToast()

    // Calcular progresso
    const completedCount = tasks.filter((t) => t.completed).length
    const totalCount = tasks.length
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    // Load Presets
    useEffect(() => {
        if (showPresets && availablePresets.length === 0) {
            setPresetsLoading(true)
            getPresets().then((result) => {
                if (result.success && result.data) {
                    setAvailablePresets(result.data)
                }
                setPresetsLoading(false)
            })
        }
    }, [showPresets, availablePresets.length])

    // Load Tasks on Mount (Ensure Freshness)
    useEffect(() => {
        // Se já tiver tasks via server (initialTasks), ótimo. 
        // Mas vamos buscar novamente para garantir que não estamos vendo dados cacheados (stale)
        // principalmente se o status mudou recentemente.
        const loadFreshTasks = async () => {
            const result = await getExecutionTasks(orderId)
            if (result.success && result.data) {
                setTasks(prev => {
                    // Evita re-render desnecessário se for igual
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
    async function handleApplyPreset(tasks: string[]) {
        setShowPresets(false)
        const result = await applyTaskPreset(orderId, tasks)

        if (result.success) {
            // Buscar tasks atualizadas do servidor (sem recarregar a página)
            const freshResult = await getExecutionTasks(orderId)
            if (freshResult.success && freshResult.data) {
                setTasks(freshResult.data)
            }
            toast({
                title: 'Preset aplicado!',
                description: `${tasks.length} tarefas adicionadas ao checklist.`,
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
            setAvailablePresets([]) // Force reload
        } else {
            toast({ title: 'Erro', description: result.message, variant: 'destructive' })
        }
    }

    // Delete preset
    async function handleDeletePreset(e: React.MouseEvent, id: string) {
        e.stopPropagation()
        const result = await deletePreset(id)
        if (result.success) {
            setAvailablePresets(prev => prev.filter(p => p.id !== id))
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
                        <div className="relative flex gap-2">
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

                            {/* Load Preset Dropdown */}
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowPresets(!showPresets)}
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Carregar Preset
                                </Button>

                                {showPresets && (
                                    <div className="absolute right-0 top-full mt-1 z-50 min-w-[240px] max-h-[300px] overflow-y-auto bg-popover border rounded-md shadow-lg p-1">
                                        {presetsLoading ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                                                Carregando...
                                            </div>
                                        ) : availablePresets.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                Nenhum preset encontrado.
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {availablePresets.map((preset) => (
                                                    <div
                                                        key={preset.id}
                                                        className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-muted group"
                                                    >
                                                        <button
                                                            className="flex-1 text-left truncate"
                                                            onClick={() => handleApplyPreset(preset.tasks)}
                                                        >
                                                            {preset.name}
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                ({preset.tasks.length} itens)
                                                            </span>
                                                        </button>
                                                        {preset.user_id !== 'system' && (
                                                            <button
                                                                onClick={(e) => handleDeletePreset(e, preset.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
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
