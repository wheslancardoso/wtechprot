-- ================================================
-- SPRINT: Segurança e Gestão - Módulo de Evidências
-- Data: 2026-01-26
-- ================================================

-- ============================================
-- TABELA: orders - Colunas de Evidências
-- ============================================

-- Fotos do Check-in (entrada do aparelho)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS photos_checkin TEXT[] DEFAULT '{}';

-- Fotos do Check-out (saída/entrega do aparelho)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS photos_checkout TEXT[] DEFAULT '{}';

-- Data de finalização
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP WITH TIME ZONE;

-- Comentários
COMMENT ON COLUMN orders.photos_checkin IS 'Array de URLs das fotos tiradas na entrada do aparelho';
COMMENT ON COLUMN orders.photos_checkout IS 'Array de URLs das fotos tiradas na entrega do aparelho';
COMMENT ON COLUMN orders.finished_at IS 'Data/hora de finalização da OS';

-- ============================================
-- SUPABASE STORAGE: Bucket os-evidence
-- ============================================
-- Execute no painel do Supabase > Storage > New Bucket
-- Nome: os-evidence
-- Public: true (para cliente visualizar)
--
-- Policies (vá em Storage > Policies):
--
-- 1. INSERT Policy (Upload):
--    - Name: "Authenticated users can upload"
--    - Allowed operation: INSERT
--    - Target roles: authenticated
--    - Policy: (auth.role() = 'authenticated')
--
-- 2. SELECT Policy (View):
--    - Name: "Anyone can view evidence"
--    - Allowed operation: SELECT
--    - Target roles: public
--    - Policy: true

-- ============================================
-- VIEW: Métricas Financeiras MEI Safe
-- ============================================

-- View para métricas do mês atual
CREATE OR REPLACE VIEW v_monthly_metrics AS
SELECT 
    DATE_TRUNC('month', finished_at) as month,
    
    -- Faturamento Real (apenas mão de obra - o que entra no MEI)
    COALESCE(SUM(labor_cost), 0) as revenue_labor,
    
    -- Custo de peças externas (NÃO soma no faturamento, apenas informativo)
    COALESCE(SUM(parts_cost_external), 0) as total_external_parts,
    
    -- Valor total recebido (registrado manualmente)
    COALESCE(SUM(amount_received), 0) as total_received,
    
    -- Quantidade de OS finalizadas
    COUNT(*) as orders_finished,
    
    -- Ticket médio de mão de obra
    COALESCE(AVG(labor_cost), 0) as avg_ticket

FROM orders
WHERE status = 'finished'
AND finished_at IS NOT NULL
GROUP BY DATE_TRUNC('month', finished_at)
ORDER BY month DESC;

-- View para métricas do mês atual específico
CREATE OR REPLACE VIEW v_current_month_metrics AS
SELECT 
    -- Faturamento Real do Mês (MÃO DE OBRA APENAS)
    COALESCE(SUM(labor_cost), 0) as mei_revenue,
    
    -- Economia gerada para clientes (peças externas)
    COALESCE(SUM(parts_cost_external), 0) as client_savings,
    
    -- Total recebido
    COALESCE(SUM(amount_received), 0) as total_received,
    
    -- Quantidade de OS
    COUNT(*) as orders_count,
    
    -- Ticket médio
    COALESCE(AVG(labor_cost), 0) as avg_ticket,
    
    -- Limite MEI 2026 (R$ 81.000 anual / 12 = ~R$ 6.750 mensal)
    6750.00 as mei_monthly_limit,
    
    -- Porcentagem do limite usado
    CASE 
        WHEN COALESCE(SUM(labor_cost), 0) > 0 
        THEN ROUND((COALESCE(SUM(labor_cost), 0) / 6750.00) * 100, 1)
        ELSE 0 
    END as mei_limit_percent

FROM orders
WHERE status = 'finished'
AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)
AND finished_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('photos_checkin', 'photos_checkout', 'finished_at')
ORDER BY column_name;
