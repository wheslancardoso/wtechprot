-- ================================================
-- SPRINT 6: Configurações da Loja (Settings)
-- Data: 2026-01-26
-- ================================================

-- ============================================
-- TABELA: tenant_settings
-- ============================================
-- Configurações personalizáveis por tenant/usuário
-- (Para multi-tenancy futuro)

CREATE TABLE IF NOT EXISTS tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- FK para o usuário dono do tenant
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dados da Loja
    trade_name TEXT NOT NULL DEFAULT 'Minha Assistência',
    legal_document TEXT, -- CNPJ ou CPF
    phone TEXT,
    email TEXT,
    
    -- Endereço (JSONB)
    address JSONB DEFAULT '{}',
    -- Formato: {street, number, complement, neighborhood, city, state, zip}
    
    -- Logo
    logo_url TEXT,
    
    -- Configurações Financeiras
    pix_key TEXT,
    pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
    
    -- Limites MEI (Configurável para Super MEI futuro)
    mei_limit_annual DECIMAL(12,2) NOT NULL DEFAULT 81000.00,
    mei_limit_monthly DECIMAL(12,2) GENERATED ALWAYS AS (mei_limit_annual / 12) STORED,
    
    -- Garantia padrão
    warranty_days_labor INTEGER NOT NULL DEFAULT 90,
    warranty_days_parts INTEGER NOT NULL DEFAULT 0, -- Peças externas não têm garantia nossa
    
    -- Controle de auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique por usuário (cada usuário tem suas configs)
    UNIQUE(user_id)
);

-- Índice para busca rápida por user_id
CREATE INDEX IF NOT EXISTS idx_tenant_settings_user ON tenant_settings(user_id);

-- Comentários
COMMENT ON TABLE tenant_settings IS 'Configurações personalizáveis por técnico/loja';
COMMENT ON COLUMN tenant_settings.mei_limit_annual IS 'Teto MEI anual (R$ 81k atual, R$ 140-150k Super MEI futuro)';
COMMENT ON COLUMN tenant_settings.address IS 'Formato: {street, number, complement, neighborhood, city, state, zip}';

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

-- Cada usuário só vê suas próprias configurações
CREATE POLICY "Users can view own settings"
ON tenant_settings FOR SELECT
USING (user_id = auth.uid());

-- Cada usuário só edita suas próprias configurações
CREATE POLICY "Users can update own settings"
ON tenant_settings FOR UPDATE
USING (user_id = auth.uid());

-- Cada usuário pode inserir suas configs (via trigger ou manual)
CREATE POLICY "Users can insert own settings"
ON tenant_settings FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCTION: Criar settings automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION fn_create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO tenant_settings (user_id, trade_name)
    VALUES (NEW.id, 'Minha Assistência')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Criar settings ao registrar usuário
-- ============================================

DROP TRIGGER IF EXISTS trg_create_default_settings ON auth.users;

-- NOTA: Este trigger pode não funcionar diretamente via SQL Editor
-- pois a tabela auth.users é gerenciada pelo Supabase Auth.
-- Alternativa: Criar as settings na primeira chamada de getSettings()

-- ============================================
-- VIEW: Settings com limite mensal calculado
-- ============================================

CREATE OR REPLACE VIEW v_tenant_settings AS
SELECT 
    ts.*,
    CASE 
        WHEN ts.logo_url IS NOT NULL THEN ts.logo_url
        ELSE '/placeholder-logo.png'
    END as logo_url_fallback,
    CASE
        WHEN ts.mei_limit_annual = 81000 THEN 'MEI Atual'
        WHEN ts.mei_limit_annual = 140000 THEN 'Super MEI (PLP 108)'
        WHEN ts.mei_limit_annual = 150000 THEN 'Super MEI (PLP 60)'
        ELSE 'Personalizado'
    END as mei_regime_label
FROM tenant_settings ts;

-- ============================================
-- SEED: Criar settings para usuários existentes
-- ============================================

INSERT INTO tenant_settings (user_id, trade_name)
SELECT id, 'WTECH Assistência'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM tenant_settings WHERE tenant_settings.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT 
    column_name, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tenant_settings'
ORDER BY ordinal_position;
