-- ==================================================
-- WTECH SaaS - Schema V2.0 (Compra Assistida)
-- Execute este script no SQL Editor do Supabase
-- ==================================================

-- ==================================================
-- 1. TIPOS ENUM
-- ==================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'open',
      'analyzing',
      'waiting_approval',
      'waiting_parts',
      'in_progress',
      'ready',
      'finished',
      'canceled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_item_type') THEN
    CREATE TYPE order_item_type AS ENUM (
      'service',
      'part_external'
    );
  END IF;
END $$;

-- ==================================================
-- 2. TABELA: customers
-- ==================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  document_id TEXT, -- CPF ou CNPJ
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por user_id (RLS)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- ==================================================
-- 3. TABELA: equipments
-- ==================================================
CREATE TABLE IF NOT EXISTS equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT, -- Notebook, Desktop, Impressora, etc.
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para JOINs com customers
CREATE INDEX IF NOT EXISTS idx_equipments_customer_id ON equipments(customer_id);

-- ==================================================
-- 4. TABELA: orders
-- ==================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id SERIAL, -- ID visual para o usuário (#0001, #0002...)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipments(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'open',
  
  -- Financeiro (Modelo Compra Assistida)
  labor_cost DECIMAL(10,2) DEFAULT 0.00, -- Custo da mão de obra
  parts_cost_external DECIMAL(10,2) DEFAULT 0.00, -- Custo das peças (cliente compra)
  
  -- Diagnóstico e Solução
  diagnosis_text TEXT,
  solution_text TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Índices para JOINs e RLS
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_equipment_id ON orders(equipment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ==================================================
-- 5. TABELA: order_items
-- ==================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type order_item_type NOT NULL DEFAULT 'service',
  price DECIMAL(10,2) DEFAULT 0.00,
  external_url TEXT, -- Link ML/Amazon para peças externas
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para JOINs com orders
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ==================================================
-- 6. TRIGGERS: updated_at automático
-- ==================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para customers
DROP TRIGGER IF EXISTS trigger_customers_updated_at ON customers;
CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para equipments
DROP TRIGGER IF EXISTS trigger_equipments_updated_at ON equipments;
CREATE TRIGGER trigger_equipments_updated_at
  BEFORE UPDATE ON equipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para orders
DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ==================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------
-- POLÍTICAS: customers
-- ------------------------------------------------
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customers" ON customers;
CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own customers" ON customers;
CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------
-- POLÍTICAS: equipments
-- (via customer_id -> user_id)
-- ------------------------------------------------
DROP POLICY IF EXISTS "Users can view own equipments" ON equipments;
CREATE POLICY "Users can view own equipments" ON equipments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = equipments.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own equipments" ON equipments;
CREATE POLICY "Users can insert own equipments" ON equipments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = equipments.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own equipments" ON equipments;
CREATE POLICY "Users can update own equipments" ON equipments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = equipments.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own equipments" ON equipments;
CREATE POLICY "Users can delete own equipments" ON equipments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = equipments.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

-- ------------------------------------------------
-- POLÍTICAS: orders
-- ------------------------------------------------
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own orders" ON orders;
CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------
-- POLÍTICAS: order_items
-- (via order_id -> user_id)
-- ------------------------------------------------
DROP POLICY IF EXISTS "Users can view own order_items" ON order_items;
CREATE POLICY "Users can view own order_items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own order_items" ON order_items;
CREATE POLICY "Users can insert own order_items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own order_items" ON order_items;
CREATE POLICY "Users can update own order_items" ON order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own order_items" ON order_items;
CREATE POLICY "Users can delete own order_items" ON order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- ==================================================
-- 8. CONFIRMAÇÃO
-- ==================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Schema V2.0 criado com sucesso!';
  RAISE NOTICE '   - Tabelas: customers, equipments, orders, order_items';
  RAISE NOTICE '   - Enums: order_status, order_item_type';
  RAISE NOTICE '   - RLS: Habilitado com políticas por user_id';
  RAISE NOTICE '   - Índices: Criados para FKs e campos de busca';
END $$;
