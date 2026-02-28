-- ==================================================
-- Migration: Webhook para o n8n (Agendamentos - V2)
-- Objetivo: Disparar quando o agendamento for CONFIRMADO
-- Data: 2026-02-26
-- ==================================================

-- 1. Garantir que a extensão existe
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Atualizar a função para enviar os dados NO MOMENTO DA CONFIRMAÇÃO
CREATE OR REPLACE FUNCTION notify_n8n_on_schedule_change()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://n8n.wfixtech.com.br/webhook/agendamentos'; 
BEGIN
  -- Só disparar se o status mudou para 'confirmed' OU se foi um INSERT já confirmado (raro)
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND OLD.status != 'confirmed') THEN
     
    PERFORM net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'type', TG_OP,
        'table', 'schedules',
        'record', row_to_json(NEW)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar a Trigger para escutar INSERT e UPDATE
DROP TRIGGER IF EXISTS on_new_schedule ON schedules;
DROP TRIGGER IF EXISTS on_schedule_event ON schedules;

CREATE TRIGGER on_schedule_event
  AFTER INSERT OR UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION notify_n8n_on_schedule_change();
