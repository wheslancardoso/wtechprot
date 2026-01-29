-- OTIMIZAÇÃO DE BANCO DE DADOS (CORRIGIDO)
-- Este script corrige os avisos de performance e utiliza as colunas corretas (user_id)

-- 1. Remover Índices Duplicados (Seguro)
DROP INDEX IF EXISTS idx_orders_created; 
DROP INDEX IF EXISTS idx_orders_customer;

-- 2. Limpar Políticas Redundantes
-- Tabela: CUSTOMERS
DROP POLICY IF EXISTS "Users can view customers" ON customers;
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can create customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;
DROP POLICY IF EXISTS "policy_customers_isolation" ON customers;

-- Tabela: EQUIPMENTS
DROP POLICY IF EXISTS "Users can view equipments" ON equipments;
DROP POLICY IF EXISTS "Users can view own equipments" ON equipments;
DROP POLICY IF EXISTS "Users can create equipments" ON equipments;
DROP POLICY IF EXISTS "Users can insert own equipments" ON equipments;
DROP POLICY IF EXISTS "Users can update equipments" ON equipments;
DROP POLICY IF EXISTS "Users can update own equipments" ON equipments;
DROP POLICY IF EXISTS "Users can delete own equipments" ON equipments;
DROP POLICY IF EXISTS "policy_equipments_isolation" ON equipments;

-- Tabela: ORDERS
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON orders;
DROP POLICY IF EXISTS "policy_orders_isolation" ON orders;

-- Tabela: ORDER_ITEMS
DROP POLICY IF EXISTS "Users can view order_items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order_items" ON order_items;
DROP POLICY IF EXISTS "Users can create order_items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order_items" ON order_items;
DROP POLICY IF EXISTS "Users can update order_items" ON order_items;
DROP POLICY IF EXISTS "Users can update own order_items" ON order_items;
DROP POLICY IF EXISTS "Users can delete own order_items" ON order_items;
DROP POLICY IF EXISTS "policy_order_items_isolation" ON order_items;

-- Tabela: ORDER_LOGS
DROP POLICY IF EXISTS "Technicians can view their order logs" ON order_logs;
DROP POLICY IF EXISTS "Users can view order_logs" ON order_logs;
DROP POLICY IF EXISTS "Service can insert logs" ON order_logs;
DROP POLICY IF EXISTS "System can insert order_logs" ON order_logs;
DROP POLICY IF EXISTS "policy_order_logs_select" ON order_logs;
DROP POLICY IF EXISTS "policy_order_logs_insert" ON order_logs;

-- Tabela: TENANTS (Configurações)
DROP POLICY IF EXISTS "Users can view own tenant settings" ON tenants;
DROP POLICY IF EXISTS "Users can update own tenant settings" ON tenants;
DROP POLICY IF EXISTS "Users can insert own tenant settings" ON tenants;
DROP POLICY IF EXISTS "policy_tenants_isolation" ON tenants;

-- Tabela: TENANT_SETTINGS (Se existir, mas o schema usa 'tenants')
-- Por segurança, removemos se houver
DROP POLICY IF EXISTS "Users can view own settings" ON tenant_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON tenant_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON tenant_settings;


-- 3. Recriar Policies Otimizadas

-- CUSTOMERS (Tem user_id)
CREATE POLICY "policy_customers_isolation" ON customers
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ORDERS (Tem user_id)
CREATE POLICY "policy_orders_isolation" ON orders
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- TENANTS (Tem id = auth.uid())
CREATE POLICY "policy_tenants_isolation" ON tenants
  FOR ALL
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- EQUIPMENTS (Via Customer)
CREATE POLICY "policy_equipments_isolation" ON equipments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = equipments.customer_id 
      AND customers.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = equipments.customer_id 
      AND customers.user_id = (SELECT auth.uid())
    )
  );

-- ORDER_ITEMS (Via Order)
CREATE POLICY "policy_order_items_isolation" ON order_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  );

-- ORDER_LOGS (Via Order)
CREATE POLICY "policy_order_logs_select" ON order_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_logs.order_id
      AND orders.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "policy_order_logs_insert" ON order_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
