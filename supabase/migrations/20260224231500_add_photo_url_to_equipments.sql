-- Adiciona campo de foto do equipamento para ícone dinâmico na página de rastreamento
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS photo_url text;
