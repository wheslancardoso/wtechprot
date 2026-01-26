-- ================================================
-- PIVOT WTECH 2026 - Modelo Compra Assistida
-- Migration: Adicionar colunas para novo modelo de negócio
-- Data: 2026-01-26
-- ================================================

-- ============================================
-- TABELA: orders
-- ============================================

-- Método de pagamento (manual: pix, dinheiro, maquininha)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('pix', 'cash', 'card_machine'));

-- Valor recebido (registro manual do pagamento)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS amount_received DECIMAL(10, 2);

-- Data do recebimento do pagamento
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMP WITH TIME ZONE;

-- Data de chegada da peça do cliente
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS part_arrival_date TIMESTAMP WITH TIME ZONE;

-- Metadados da assinatura digital (IP, geolocation, device, timestamp)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS signature_metadata JSONB;

-- Comentários
COMMENT ON COLUMN orders.payment_method IS 'Método de pagamento: pix, cash (dinheiro), card_machine (maquininha)';
COMMENT ON COLUMN orders.amount_received IS 'Valor efetivamente recebido pelo técnico';
COMMENT ON COLUMN orders.payment_received_at IS 'Data/hora do recebimento do pagamento';
COMMENT ON COLUMN orders.part_arrival_date IS 'Data em que a peça externa chegou na assistência';
COMMENT ON COLUMN orders.signature_metadata IS 'Dados do aceite: {ip, userAgent, timestamp, checkbox_accepted}';

-- ============================================
-- TABELA: order_items
-- ============================================

-- Flag para identificar peça externa (compra assistida)
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS is_external_part BOOLEAN DEFAULT FALSE;

-- URL externa para compra da peça (link afiliado/ML)
-- Nota: já existe external_url, mas garantindo que existe
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Status da peça externa
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS part_status TEXT DEFAULT 'pending' 
CHECK (part_status IN ('pending', 'ordered', 'arrived'));

-- Preço estimado (apenas informativo, não soma no faturamento MEI)
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS estimated_price DECIMAL(10, 2);

-- Comentários
COMMENT ON COLUMN order_items.is_external_part IS 'True se a peça é comprada externamente pelo cliente';
COMMENT ON COLUMN order_items.external_url IS 'Link de compra externa (Mercado Livre, etc)';
COMMENT ON COLUMN order_items.part_status IS 'Status da peça: pending, ordered, arrived';
COMMENT ON COLUMN order_items.estimated_price IS 'Preço estimado da peça (apenas informativo)';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('orders', 'order_items')
AND column_name IN (
    'payment_method', 
    'amount_received',
    'payment_received_at',
    'part_arrival_date', 
    'signature_metadata',
    'is_external_part',
    'external_url',
    'part_status',
    'estimated_price'
)
ORDER BY table_name, column_name;
