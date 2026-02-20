// ==================================================
// Tipos
// ==================================================
export interface ExecutionTask {
    id: string
    title: string // Mudado de label para title conforme solicitado
    completed: boolean
    completed_at: string | null
}

export interface TaskPreset {
    id: string
    user_id: string
    name: string
    tasks: string[] // Armazenamos apenas os títulos das tarefas no preset
    created_at: string
}

// ==================================================
// Presets Padrão (Fallback estático)
// ==================================================
export const DEFAULT_TASK_PRESETS = {
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
        name: 'Substituição de Display',
        tasks: [
            'Abertura Técnica do Equipamento',
            'Remoção do Painel Danificado',
            'Manutenção Preventiva e Preparação',
            'Instalação do Novo Painel',
            'Reconexão de Hardware',
            'Montagem Final',
            'Teste de Toque e Imagem',
        ],
    },
    troca_bateria: {
        name: 'Substituição de Bateria',
        tasks: [
            'Abertura Técnica do Equipamento',
            'Remoção do Componente Antigo',
            'Instalação da Nova Bateria',
            'Montagem Final',
            'Calibração e Otimização',
            'Teste de Eficiência de Carga',
        ],
    },
    manutencao_preventiva: {
        name: 'Manutenção Preventiva',
        tasks: [
            'Abertura Técnica',
            'Higienização de Componentes Internos',
            'Revisão Térmica (Pasta Térmica)',
            'Montagem',
            'Teste de Stress Térmico',
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
