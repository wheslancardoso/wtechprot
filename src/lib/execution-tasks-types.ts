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
