-- ================================================
-- SPRINT 8: Blindagem de Assinatura Digital
-- Data: 2026-01-26
-- ================================================

-- ============================================
-- ADICIONAR COLUNAS PARA METADADOS DE ASSINATURA
-- ============================================

-- Metadados da assinatura (IP, UserAgent, Geo, Hash)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS signature_metadata JSONB DEFAULT NULL;

-- Hash de integridade (SHA-256)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS integrity_hash TEXT DEFAULT NULL;

-- Data/hora exata da aprovação (com timezone)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ DEFAULT NULL;

-- Comentários
COMMENT ON COLUMN orders.signature_metadata IS 'Metadados da assinatura digital: {ip, user_agent, geo: {lat, lng, accuracy}, geo_denied, device_fingerprint}';
COMMENT ON COLUMN orders.integrity_hash IS 'Hash SHA-256 para verificação de integridade: ID+DATA+VALOR+IP';
COMMENT ON COLUMN orders.approved_at IS 'Momento exato da aprovação do orçamento pelo cliente';

-- ============================================
-- ÍNDICE PARA BUSCA POR HASH
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_integrity_hash ON orders(integrity_hash);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('signature_metadata', 'integrity_hash', 'approved_at');
