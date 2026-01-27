-- ================================================
-- SPRINT: Presets de Execução
-- Data: 2026-01-27
-- ================================================

-- 1. Criar tabela de Presets
CREATE TABLE IF NOT EXISTS task_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    tasks JSONB NOT NULL DEFAULT '[]', -- Array de strings ou objetos simples
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE task_presets ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança (Isolamento por usuário)
CREATE POLICY "Users can view own presets"
ON task_presets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own presets"
ON task_presets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets"
ON task_presets FOR DELETE
USING (auth.uid() = user_id);

-- 4. Garantir coluna execution_tasks na tabela orders (já deve existir, mas reforçando)
-- Vamos garantir que o comentário reflita a estrutura nova com 'title'
COMMENT ON COLUMN orders.execution_tasks IS 'Array de sub-tarefas: [{id, title, completed, completed_at}]';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT * FROM pg_tables WHERE tablename = 'task_presets';
