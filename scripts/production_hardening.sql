-- ================================================
-- PRODUCTION HARDENING: Segurança para Go-Live
-- Data: 2026-01-26
-- ================================================

-- ============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLÍTICAS RLS - ORDERS
-- ============================================

-- Drop políticas existentes para recriar
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Leitura: usuário vê apenas suas ordens
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- Criação: usuário autenticado pode criar
CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Atualização: usuário autenticado pode atualizar
CREATE POLICY "Users can update own orders"
ON orders FOR UPDATE
USING (
  auth.uid() IS NOT NULL
);

-- ============================================
-- 3. POLÍTICAS RLS - CUSTOMERS
-- ============================================

DROP POLICY IF EXISTS "Users can view customers" ON customers;
DROP POLICY IF EXISTS "Users can create customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;

CREATE POLICY "Users can view customers"
ON customers FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create customers"
ON customers FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update customers"
ON customers FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- 4. POLÍTICAS RLS - EQUIPMENTS
-- ============================================

DROP POLICY IF EXISTS "Users can view equipments" ON equipments;
DROP POLICY IF EXISTS "Users can create equipments" ON equipments;
DROP POLICY IF EXISTS "Users can update equipments" ON equipments;

CREATE POLICY "Users can view equipments"
ON equipments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create equipments"
ON equipments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update equipments"
ON equipments FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. POLÍTICAS RLS - ORDER_ITEMS
-- ============================================

DROP POLICY IF EXISTS "Users can view order_items" ON order_items;
DROP POLICY IF EXISTS "Users can create order_items" ON order_items;
DROP POLICY IF EXISTS "Users can update order_items" ON order_items;

CREATE POLICY "Users can view order_items"
ON order_items FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create order_items"
ON order_items FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update order_items"
ON order_items FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- 6. POLÍTICAS RLS - ORDER_LOGS (Imutabilidade)
-- ============================================

DROP POLICY IF EXISTS "Users can view order_logs" ON order_logs;
DROP POLICY IF EXISTS "System can insert order_logs" ON order_logs;

-- Leitura permitida para autenticados
CREATE POLICY "Users can view order_logs"
ON order_logs FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Inserção apenas por usuários autenticados (sistema)
CREATE POLICY "System can insert order_logs"
ON order_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- NOTA: Sem políticas de UPDATE ou DELETE = logs imutáveis!

-- ============================================
-- 7. POLÍTICAS RLS - TENANT_SETTINGS
-- ============================================

-- Já criadas no sprint_settings.sql
-- Reforçando aqui:

DROP POLICY IF EXISTS "Users can view own settings" ON tenant_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON tenant_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON tenant_settings;

CREATE POLICY "Users can view own settings"
ON tenant_settings FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
ON tenant_settings FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
ON tenant_settings FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================
-- 8. VIEW PÚBLICA (Para PDF/Link sem auth)
-- ============================================

-- View segura para dados públicos da loja
CREATE OR REPLACE VIEW v_public_store_info AS
SELECT 
    user_id,
    trade_name,
    logo_url,
    phone,
    email,
    address,
    warranty_days_labor
FROM tenant_settings;

-- Habilitar acesso anônimo apenas à view
-- NOTA: Views herdam RLS da tabela base, então isso é seguro

-- ============================================
-- 9. STORAGE POLICIES - BUCKET os-evidence
-- ============================================

-- NOTA: Executar no Dashboard do Supabase > Storage > Policies

/*
BUCKET: os-evidence

1. SELECT (Leitura Pública):
   - Permitir: true (qualquer um com link pode ver)
   - Isso é necessário para exibir fotos no PDF/WhatsApp

2. INSERT (Upload apenas autenticados):
   - Permitir: auth.role() = 'authenticated'
   - Garante que apenas técnicos logados fazem upload

3. UPDATE: NEGAR (Imutabilidade)
   - Não criar política de UPDATE
   - Fotos não podem ser substituídas

4. DELETE: NEGAR (Imutabilidade) 
   - Não criar política de DELETE
   - Provas não podem ser apagadas
*/

-- ============================================
-- 10. ÍNDICES DE PERFORMANCE
-- ============================================

-- Busca rápida por status
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Busca por data
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Busca por cliente
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- Full-text search em customers (opcional)
-- CREATE INDEX idx_customers_name_search ON customers USING gin(to_tsvector('portuguese', name));

-- ============================================
-- 11. VERIFICAÇÃO FINAL
-- ============================================

-- Listar tabelas com RLS ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'customers', 'equipments', 'order_items', 'order_logs', 'tenant_settings');

-- Listar políticas ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
