'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DEFAULT_TASK_PRESETS, type ExecutionTask, type TaskPreset } from './execution-tasks-types'

// ==================================================
// PRESENTS ACTIONS (CRUD)
// ==================================================

// Listar Presets (Padrão + Salvos)
export async function getPresets(): Promise<{
    success: boolean
    data?: TaskPreset[]
    message?: string
}> {
    try {
        const supabase = await createClient()

        // Buscar presets salvos no banco
        const { data: savedPresets, error } = await supabase
            .from('task_presets')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar presets:', error)
            return { success: false, message: error.message }
        }

        // Converter presets padrão para o formato TaskPreset
        const defaultPresets: TaskPreset[] = Object.entries(DEFAULT_TASK_PRESETS).map(([key, value]) => ({
            id: `default_${key}`,
            user_id: 'system',
            name: value.name,
            tasks: [...value.tasks], // Spread para criar cópia mutável
            created_at: new Date().toISOString(),
        }))

        // Combinar (Salvos primeiro)
        const allPresets = [...(savedPresets || []), ...defaultPresets]

        return { success: true, data: allPresets }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

// Salvar Novo Preset
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

        if (error) {
            return { success: false, message: error.message }
        }

        revalidatePath('/dashboard/orders/[id]', 'page')
        return { success: true, message: 'Preset salvo com sucesso!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

// Deletar Preset
export async function deletePreset(id: string): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('task_presets')
            .delete()
            .eq('id', id)

        if (error) {
            return { success: false, message: error.message }
        }

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

        if (error) {
            return { success: false, message: error.message }
        }

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
): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        // Buscar tarefas atuais
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('execution_tasks')
            .eq('id', orderId)
            .single()

        if (fetchError) {
            return { success: false, message: fetchError.message }
        }

        const currentTasks = (order?.execution_tasks || []) as ExecutionTask[]

        // Criar nova tarefa
        const newTask: ExecutionTask = {
            id: `task_${Date.now()}`,
            title, // Usando title
            completed: false,
            completed_at: null,
        }

        // Atualizar
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                execution_tasks: [...currentTasks, newTask],
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        if (updateError) {
            return { success: false, message: updateError.message }
        }

        revalidatePath(`/dashboard/orders/${orderId}`)
        return { success: true, message: 'Tarefa adicionada!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

export async function applyTaskPreset(
    orderId: string,
    tasks: string[] // Recebe lista de strings direto agora
): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()

        // Buscar tarefas atuais
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('execution_tasks')
            .eq('id', orderId)
            .single()

        if (fetchError) {
            return { success: false, message: fetchError.message }
        }

        const currentTasks = (order?.execution_tasks || []) as ExecutionTask[]

        // Criar tarefas do preset
        const newTasks: ExecutionTask[] = tasks.map((title, index) => ({
            id: `preset_${index}_${Date.now()}`,
            title,
            completed: false,
            completed_at: null,
        }))

        // Atualizar (adiciona ao existente)
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                execution_tasks: [...currentTasks, ...newTasks],
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        if (updateError) {
            return { success: false, message: updateError.message }
        }

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
        const supabase = await createClient()

        // Buscar tarefas atuais
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('execution_tasks, display_id')
            .eq('id', orderId)
            .single()

        if (fetchError) {
            return { success: false, message: fetchError.message }
        }

        const currentTasks = (order?.execution_tasks || []) as ExecutionTask[]

        // Encontrar e atualizar a tarefa
        const taskIndex = currentTasks.findIndex((t) => t.id === taskId)
        if (taskIndex === -1) {
            return { success: false, message: 'Tarefa não encontrada' }
        }

        const task = currentTasks[taskIndex]

        // Fallback de compatibilidade se task.title não existir (migração smooth)
        const taskLabel = task.title || (task as any).label || 'Tarefa'

        const updatedTasks = [...currentTasks]
        updatedTasks[taskIndex] = {
            ...task,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
        }

        // Atualizar ordem
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                execution_tasks: updatedTasks,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        if (updateError) {
            return { success: false, message: updateError.message }
        }

        // Registrar no log se completou
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

        return {
            success: true,
            message: completed ? `"${taskLabel}" concluída!` : `"${taskLabel}" reaberta`,
        }
    } catch (error) {
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
        const supabase = await createClient()

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('execution_tasks')
            .eq('id', orderId)
            .single()

        if (fetchError) {
            return { success: false, message: fetchError.message }
        }

        const currentTasks = (order?.execution_tasks || []) as ExecutionTask[]
        const updatedTasks = currentTasks.filter((t) => t.id !== taskId)

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                execution_tasks: updatedTasks,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        if (updateError) {
            return { success: false, message: updateError.message }
        }

        revalidatePath(`/dashboard/orders/${orderId}`)
        return { success: true, message: 'Tarefa removida!' }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}
