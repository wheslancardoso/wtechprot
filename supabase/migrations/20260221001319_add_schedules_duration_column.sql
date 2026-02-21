-- ==================================================
-- Migration: Add duration_minutes to schedules
-- ==================================================

-- Adiciona a coluna com valor default de 120 minutos (2 horas)
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 120;

-- O sistema assumirá 2 horas para todos os agendamentos antigos.
