-- ================================================
-- Migration: Adicionar colunas de aprovação/cancelamento
-- Data: 2026-01-26
-- ================================================

-- Adicionar coluna approved_at (data de aprovação do orçamento pelo cliente)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna canceled_at (data de cancelamento da OS)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;

-- Comentários para documentação
COMMENT ON COLUMN orders.approved_at IS 'Data em que o cliente aprovou o orçamento';
COMMENT ON COLUMN orders.canceled_at IS 'Data em que a OS foi cancelada';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('approved_at', 'canceled_at');
