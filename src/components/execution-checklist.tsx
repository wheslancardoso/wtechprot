'use client'

import { useState, useTransition } from 'react'
import {
    toggleExecutionTask,
    addExecutionTask,
    applyTaskPreset,
    removeExecutionTask,
} from '@/lib/execution-tasks-actions'
import {
    TASK_PRESETS,
    type ExecutionTask,
    type PresetKey,
} from '@/lib/execution-tasks-types'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

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
    const [showPresets, setShowPresets] = useState(false)

    // Calcular progresso
    const completedCount = tasks.filter((t) => t.completed).length
    const totalCount = tasks.length
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

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

        if (result.success) {
            const newTask: ExecutionTask = {
                id: `task_${Date.now()}`,
                label: newTaskLabel.trim(),
                completed: false,
                completed_at: null,
            }
            setTasks((prev) => [...prev, newTask])
            setNewTaskLabel('')
        }
    }

    // Apply preset
    async function handleApplyPreset(presetKey: PresetKey) {
        setShowPresets(false)
        const result = await applyTaskPreset(orderId, presetKey)

        if (result.success) {
            // Reload page to get new tasks
            window.location.reload()
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
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPresets(!showPresets)}
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Presets
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>

                            {showPresets && (
                                <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-popover border rounded-md shadow-lg p-1">
                                    {Object.entries(TASK_PRESETS).map(([key, preset]) => (
                                        <button
                                            key={key}
                                            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                                            onClick={() => handleApplyPreset(key as PresetKey)}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
                        {isEditable && ' Adicione uma ou selecione um preset.'}
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
                                    {task.label}
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
