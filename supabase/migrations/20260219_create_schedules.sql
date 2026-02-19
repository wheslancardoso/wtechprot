-- ==================================================
-- Migration: Sistema de Agendamento Exclusivo
-- Data: 2026-02-19
-- ==================================================

-- Enum de status de agendamento
CREATE TYPE schedule_status AS ENUM ('pending', 'confirmed', 'canceled', 'expired');

-- Tabela principal de agendamentos
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    status schedule_status NOT NULL DEFAULT 'pending',
    scheduled_date DATE,
    scheduled_time TIME,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(30),
    notes TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de configurações de horário do técnico
CREATE TABLE IF NOT EXISTS schedule_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    work_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 0=Domingo, 6=Sábado
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL DEFAULT '18:00',
    slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
    lunch_start TIME DEFAULT '12:00',
    lunch_end TIME DEFAULT '13:00',
    max_advance_days INTEGER NOT NULL DEFAULT 30, -- Até quantos dias no futuro agendar
    token_expiry_hours INTEGER NOT NULL DEFAULT 48, -- Validade do link em horas
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_schedules_token ON schedules(token);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_scheduled_date ON schedules(scheduled_date);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_settings_updated_at
    BEFORE UPDATE ON schedule_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_settings ENABLE ROW LEVEL SECURITY;

-- Políticas: Técnico vê apenas seus agendamentos
CREATE POLICY "Técnicos podem ver seus agendamentos"
    ON schedules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Técnicos podem inserir agendamentos"
    ON schedules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Técnicos podem atualizar seus agendamentos"
    ON schedules FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: Leitura pública por token (para a página do cliente)
CREATE POLICY "Clientes podem ver agendamento pelo token"
    ON schedules FOR SELECT
    USING (true); -- O filtro por token será feito na query

-- Políticas: Configurações do técnico
CREATE POLICY "Técnicos podem ver suas configurações"
    ON schedule_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Técnicos podem inserir suas configurações"
    ON schedule_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Técnicos podem atualizar suas configurações"
    ON schedule_settings FOR UPDATE
    USING (auth.uid() = user_id);
