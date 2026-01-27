'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DEFAULT_TASK_PRESETS, type ExecutionTask, type TaskPreset } from './execution-tasks-types'

// ==================================================
// PRESENTS ACTIONS (CRUD)
// ==================================================

export async function getPresets(): Promise<{
    success: boolean
    data?: TaskPreset[]
    message?: string
}> {
    try {
        const supabase = await createClient()
        const { data: savedPresets, error } = await supabase
            .from('task_presets')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar presets:', error)
            return { success: false, message: error.message }
        }

        const defaultPresets: TaskPreset[] = Object.entries(DEFAULT_TASK_PRESETS).map(([key, value]) => ({
            id: `default_${key}`,
            user_id: 'system',
            name: value.name,
            tasks: [...value.tasks],
            created_at: new Date().toISOString(),
        }))

        const allPresets = [...(savedPresets || []), ...defaultPresets]
        return { success: true, data: allPresets }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

export async function savePreset(
    name: string,
    tasks: string[]
): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('task_presets').insert({
            name,
            tasks,
        })

        if (error) return { success: false, message: error.message }

        revalidatePath('/dashboard/orders/[id]', 'page')
        return { success: true, message: 'Preset salvo com sucesso!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

export async function deletePreset(id: string): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('task_presets')
            .delete()
            .eq('id', id)

        if (error) return { success: false, message: error.message }

        revalidatePath('/dashboard/orders/[id]', 'page')
        return { success: true, message: 'Preset removido!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

// ==================================================
// EXECUTION TASKS ACTIONS
// ==================================================

export async function getExecutionTasks(orderId: string): Promise<{
    success: boolean
    data?: ExecutionTask[]
    message?: string
}> {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('orders')
            .select('execution_tasks')
            .eq('id', orderId)
            .single()

        if (error) return { success: false, message: error.message }

        const tasks = (data?.execution_tasks || []) as ExecutionTask[]
        return { success: true, data: tasks }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

export async function addExecutionTask(
    orderId: string,
    title: string
): Promise<{ success: boolean; message: string; task?: ExecutionTask }> {
    try {
        const supabase = await createClient()

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('execution_tasks')
            .eq('id', orderId)
            .single()

        if (fetchError) return { success: false, message: fetchError.message }

        const currentTasks = (order?.execution_tasks || []) as ExecutionTask[]

        // Server-side ID generation
        const newTask: ExecutionTask = {
            id: `task_${Date.now()}`,
            title,
            completed: false,
            completed_at: null,
        }

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                execution_tasks: [...currentTasks, newTask],
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        if (updateError) return { success: false, message: updateError.message }

        revalidatePath(`/dashboard/orders/${orderId}`)
        // Retornamos a task com o ID gerado pelo servidor para o cliente usar
        return { success: true, message: 'Tarefa adicionada!', task: newTask }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

export async function applyTaskPreset(
    orderId: string,
    tasks: string[]
): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('execution_tasks')
            .eq('id', orderId)
            .single()

        if (fetchError) return { success: false, message: fetchError.message }

        const currentTasks = (order?.execution_tasks || []) as ExecutionTask[]

        const newTasks: ExecutionTask[] = tasks.map((title, index) => ({
            id: `preset_${index}_${Date.now()}`,
            title,
            completed: false,
            completed_at: null,
        }))

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                execution_tasks: [...currentTasks, ...newTasks],
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        if (updateError) return { success: false, message: updateError.message }

        revalidatePath(`/dashboard/orders/${orderId}`)
        return { success: true, message: 'Preset aplicado!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

export async function toggleExecutionTask(
    orderId: string,
    taskId: string,
    completed: boolean
): Promise<{ success: boolean; message: string }> {
    try {
        console.log(`[Toggle] Iniciando toggle para task ${taskId} na ordem ${orderId}. Completed: ${completed}`)
        const supabase = await createClient()

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('execution_tasks, display_id')
            .eq('id', orderId)
            .single()

        if (fetchError) {
            console.error('[Toggle] Erro fetch:', fetchError)
            return { success: false, message: fetchError.message }
        }

        const currentTasks = (order?.execution_tasks || []) as ExecutionTask[]

        const taskIndex = currentTasks.findIndex((t) => t.id === taskId)
        if (taskIndex === -1) {
            console.error(`[Toggle] Tarefa ${taskId} não encontrada no array do servidor`)
            return { success: false, message: 'Tarefa não encontrada' }
        }

        const task = currentTasks[taskIndex]
        const taskLabel = task.title || (task as any).label || 'Tarefa'

        const updatedTasks = [...currentTasks]
        updatedTasks[taskIndex] = {
            ...task,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
        }

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                execution_tasks: updatedTasks,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        if (updateError) {
            console.error('[Toggle] Erro update:', updateError)
            return { success: false, message: updateError.message }
        }

        if (completed) {
            await supabase.from('order_logs').insert({
                order_id: orderId,
                previous_status: 'in_progress',
                new_status: 'in_progress',
                notes: `Execução: ${taskLabel}`,
            })
        }

        revalidatePath(`/dashboard/orders/${orderId}`)
        revalidatePath(`/os/${orderId}`)

        console.log('[Toggle] Sucesso!')
        return {
            success: true,
            message: completed ? `"${taskLabel}" concluída!` : `"${taskLabel}" reaberta`,
        }
    } catch (error) {
        console.error('[Toggle] Crash:', error)
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

export async function removeExecutionTask(
    orderId: string,
    taskId: string
): Promise<{ success: boolean; message: string }> {
    try {
        console.log(`[Remove] Iniciando remoção para task ${taskId} na ordem ${orderId}`)
        const supabase = await createClient()

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('execution_tasks')
            .eq('id', orderId)
            .single()

        if (fetchError) return { success: false, message: fetchError.message }

        const currentTasks = (order?.execution_tasks || []) as ExecutionTask[]
        const updatedTasks = currentTasks.filter((t) => t.id !== taskId)

        if (updatedTasks.length === currentTasks.length) {
            console.warn(`[Remove] ID ${taskId} não encontrado para remover.`)
        }

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                execution_tasks: updatedTasks,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        if (updateError) return { success: false, message: updateError.message }

        revalidatePath(`/dashboard/orders/${orderId}`)
        return { success: true, message: 'Tarefa removida!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}
