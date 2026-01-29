-- CORREÇÃO DE SEGURANÇA: View Security Definer (CORRIGIDO)
-- Corrige os erros apontados pelo linter e usa os NOMES DE COLUNAS CORRETOS (previous_status, changed_by)

-- 1. v_public_store_info (Mantém DEFINER + search_path para segurança)
DROP VIEW IF EXISTS v_public_store_info;
CREATE OR REPLACE VIEW v_public_store_info 
WITH (security_barrier)
AS
SELECT 
    user_id,
    trade_name,
    logo_url,
    phone,
    email,
    address,
    warranty_days_labor /*, warranty_days_parts se existir */
FROM tenant_settings;

ALTER VIEW v_public_store_info OWNER TO postgres;
-- Definir propriedade de segurança explícita
ALTER VIEW v_public_store_info SET (security_invoker = false);

-- 2. Corrigir Views de Métricas (Devem ser INVOKER / Padrão)

DROP VIEW IF EXISTS v_current_month_metrics;
CREATE OR REPLACE VIEW v_current_month_metrics AS
SELECT 
  count(*) FILTER (WHERE status = 'finished') as finished_count,
  COALESCE(sum(labor_cost + parts_cost_external) FILTER (WHERE status = 'finished'), 0) as total_revenue,
  count(*) FILTER (WHERE status = 'open') as open_count,
  count(*) FILTER (WHERE status = 'analyzing') as analyzing_count
FROM orders
WHERE 
  date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE);

DROP VIEW IF EXISTS v_monthly_metrics;
CREATE OR REPLACE VIEW v_monthly_metrics AS
SELECT 
  to_char(created_at, 'YYYY-MM') as month,
  count(*) as total_orders,
  count(*) FILTER (WHERE status = 'finished') as finished_orders,
  COALESCE(sum(labor_cost + parts_cost_external) FILTER (WHERE status = 'finished'), 0) as revenue
FROM orders
GROUP BY 1
ORDER BY 1 DESC
LIMIT 12;

-- CORREÇÃO AQUI: Colunas corretas da tabela order_logs
DROP VIEW IF EXISTS v_order_timeline;
CREATE OR REPLACE VIEW v_order_timeline AS
SELECT 
  id,
  order_id,
  previous_status, -- Era old_status (incorreto)
  new_status,
  changed_by,      -- Era created_by (incorreto)
  changed_by_type,
  metadata,
  created_at,
   -- Coluna auxiliar formatada (útil para frontend)
  (created_at AT TIME ZONE 'America/Sao_Paulo') as created_at_br
FROM order_logs
ORDER BY created_at DESC;

DROP VIEW IF EXISTS v_tenant_settings;
-- Esta view é redundante se for SELECT *, mas se existia, vamos manter INVOKER
CREATE OR REPLACE VIEW v_tenant_settings AS
SELECT * FROM tenant_settings;
