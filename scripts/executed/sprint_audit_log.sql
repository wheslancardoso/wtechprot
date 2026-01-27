-- ================================================
-- SPRINT: Audit Log + Timeline Corrigida
-- Data: 2026-01-26
-- ================================================

-- ============================================
-- TABELA: order_logs (Trilha de Auditoria)
-- ============================================
-- Registro imutável de todas as mudanças de status
-- para validade jurídica e rastreabilidade

CREATE TABLE IF NOT EXISTS order_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referência à OS
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Status anterior e novo
    previous_status TEXT,
    new_status TEXT NOT NULL,
    
    -- Quem fez a alteração
    changed_by UUID REFERENCES auth.users(id),
    changed_by_type TEXT DEFAULT 'technician' CHECK (changed_by_type IN ('technician', 'customer', 'system')),
    
    -- Metadados extras (motivo, rastreio, etc)
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp CRÍTICO - sempre em UTC, convertido para exibição
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Índices
    CONSTRAINT order_logs_status_check CHECK (
        new_status IN ('open', 'analyzing', 'waiting_approval', 'waiting_parts', 'in_progress', 'ready', 'finished', 'canceled')
    )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_order_logs_order_id ON order_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_logs_created_at ON order_logs(created_at DESC);

-- Comentários
COMMENT ON TABLE order_logs IS 'Trilha de auditoria imutável para mudanças de status das OS';
COMMENT ON COLUMN order_logs.created_at IS 'Timestamp em UTC - converter para America/Sao_Paulo na exibição';
COMMENT ON COLUMN order_logs.metadata IS 'Dados extras: {reason, tracking_code, ip, userAgent}';

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE order_logs ENABLE ROW LEVEL SECURITY;

-- Técnico pode ver logs das suas OS
CREATE POLICY "Technicians can view their order logs"
ON order_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_logs.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Sistema pode inserir logs (via service role)
CREATE POLICY "Service can insert logs"
ON order_logs FOR INSERT
WITH CHECK (true);

-- ============================================
-- FUNÇÃO: Inserir log de auditoria
-- ============================================

CREATE OR REPLACE FUNCTION fn_log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Só loga se o status realmente mudou
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_logs (
            order_id,
            previous_status,
            new_status,
            changed_by,
            metadata
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid(),
            jsonb_build_object(
                'triggered_at', NOW(),
                'trigger_type', 'automatic'
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-log em mudanças de status
-- ============================================

DROP TRIGGER IF EXISTS trg_order_status_change ON orders;

CREATE TRIGGER trg_order_status_change
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION fn_log_order_status_change();

-- ============================================
-- SEED: Criar log inicial para OS existentes
-- ============================================

INSERT INTO order_logs (order_id, previous_status, new_status, changed_by_type, metadata)
SELECT 
    id,
    NULL,
    status,
    'system',
    jsonb_build_object('reason', 'Migração inicial', 'migrated_at', NOW())
FROM orders
WHERE NOT EXISTS (
    SELECT 1 FROM order_logs WHERE order_logs.order_id = orders.id
);

-- ============================================
-- VIEW: Timeline formatada (Horário de Brasília)
-- ============================================

CREATE OR REPLACE VIEW v_order_timeline AS
SELECT 
    ol.id,
    ol.order_id,
    ol.previous_status,
    ol.new_status,
    ol.changed_by,
    ol.changed_by_type,
    ol.metadata,
    ol.created_at,
    -- Formatado para Brasília
    (ol.created_at AT TIME ZONE 'America/Sao_Paulo') as created_at_br,
    -- Formato legível
    TO_CHAR(ol.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY "às" HH24:MI') as formatted_date
FROM order_logs ol
ORDER BY ol.created_at DESC;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'order_logs'
ORDER BY ordinal_position;
