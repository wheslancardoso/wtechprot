'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ==================================================
// Tipos
// ==================================================
export interface ExecutionTask {
    id: string
    label: string
    completed: boolean
    completed_at: string | null
}

// ==================================================
// Presets de Tarefas
// ==================================================
export const TASK_PRESETS = {
    formatacao: {
        name: 'Formatação',
        tasks: [
            'Backup de Dados',
            'Formatação do Sistema',
            'Instalação do Sistema Operacional',
            'Instalação de Drivers',
            'Instalação de Programas Essenciais',
            'Restauração de Dados',
            'Testes Finais',
        ],
    },
    troca_tela: {
        name: 'Troca de Tela',
        tasks: [
            'Desmontagem do Aparelho',
            'Remoção da Tela Danificada',
            'Limpeza e Preparação',
            'Instalação da Nova Tela',
            'Reconexão de Componentes',
            'Montagem Final',
            'Teste de Toque e Display',
        ],
    },
    troca_bateria: {
        name: 'Troca de Bateria',
        tasks: [
            'Desmontagem do Aparelho',
            'Remoção da Bateria Antiga',
            'Instalação da Nova Bateria',
            'Montagem Final',
            'Calibração de Bateria',
            'Teste de Carga',
        ],
    },
    limpeza: {
        name: 'Limpeza Interna',
        tasks: [
            'Desmontagem',
            'Limpeza de Componentes',
            'Troca de Pasta Térmica',
            'Montagem',
            'Teste de Temperatura',
        ],
    },
    diagnostico: {
        name: 'Diagnóstico',
        tasks: [
            'Análise Visual',
            'Teste de Hardware',
            'Teste de Software',
            'Elaboração de Orçamento',
        ],
    },
} as const

export type PresetKey = keyof typeof TASK_PRESETS

// ==================================================
// Buscar Tarefas de Execução
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

// ==================================================
// Adicionar Tarefa Individual
// ==================================================
export async function addExecutionTask(
    orderId: string,
    label: string
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
            label,
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

// ==================================================
// Aplicar Preset de Tarefas
// ==================================================
export async function applyTaskPreset(
    orderId: string,
    presetKey: PresetKey
): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient()
        const preset = TASK_PRESETS[presetKey]

        if (!preset) {
            return { success: false, message: 'Preset não encontrado' }
        }

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
        const newTasks: ExecutionTask[] = preset.tasks.map((label, index) => ({
            id: `preset_${presetKey}_${index}_${Date.now()}`,
            label,
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
        return { success: true, message: `Preset "${preset.name}" aplicado!` }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

// ==================================================
// Marcar/Desmarcar Tarefa
// ==================================================
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
                notes: `Etapa concluída: ${task.label}`,
            })
        }

        revalidatePath(`/dashboard/orders/${orderId}`)
        revalidatePath(`/os/${orderId}`)

        return {
            success: true,
            message: completed ? `"${task.label}" concluída!` : `"${task.label}" reaberta`,
        }
    } catch (error) {
        return {
            success: false,
            message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        }
    }
}

// ==================================================
// Remover Tarefa
// ==================================================
export async function removeExecutionTask(
    orderId: string,
    taskId: string
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
        const updatedTasks = currentTasks.filter((t) => t.id !== taskId)

        // Atualizar
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
