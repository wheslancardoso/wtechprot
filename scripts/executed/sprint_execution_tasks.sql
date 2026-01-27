-- ================================================
-- SPRINT: Checklist de Execução
-- Data: 2026-01-26
-- ================================================

-- ============================================
-- ADICIONAR COLUNA EXECUTION_TASKS
-- ============================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS execution_tasks JSONB DEFAULT '[]';

-- Comentário
COMMENT ON COLUMN orders.execution_tasks IS 'Array de sub-tarefas: [{id, label, completed, completed_at}]';

-- Índice para busca em JSONB (opcional, para queries futuras)
CREATE INDEX IF NOT EXISTS idx_orders_execution_tasks ON orders USING gin(execution_tasks);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 
    column_name, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'execution_tasks';
