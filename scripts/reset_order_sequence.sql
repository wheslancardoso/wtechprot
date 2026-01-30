-- RODE ESTE SCRIPT NO EDITOR SQL DO SUPABASE
-- Função: Ajustar a contagem do ID de exibição (display_id) para o último valor existente
-- Isso é útil após excluir as últimas OSs criadas para evitar "pulos" na numeração.

-- 1. Verifica qual o maior display_id atual
DO $$
DECLARE
    max_id INT;
BEGIN
    SELECT COALESCE(MAX(display_id), 0) INTO max_id FROM orders;
    
    -- 2. Atualiza a sequência para esse valor
    -- O próximo ID gerado será (max_id + 1)
    PERFORM setval('orders_display_id_seq', max_id);
    
    RAISE NOTICE 'Sequência ajustada. O próximo ID será: %', (max_id + 1);
END $$;
