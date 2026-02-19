DO $$
DECLARE
    r RECORD;
    target_tables TEXT[] := ARRAY[
        'public.follow_ups',
        'public.nps_feedbacks',
        'public.technical_reports',
        'public.order_items',
        'public.order_logs',
        'public.hardware_telemetry'
    ];
BEGIN
    RAISE NOTICE '🔧 Iniciando verificação de CASCADE DELETE para tabelas relacionadas a orders...';

    -- Loop para encontrar e remover FKs antigas que apontam para 'orders' nas tabelas alvo
    FOR r IN 
        SELECT 
            con.conname, 
            cl.relname::text as table_name,
            con.confdeltype
        FROM pg_constraint con
        JOIN pg_class cl ON con.conrelid = cl.oid
        JOIN pg_namespace nsp ON cl.relnamespace = nsp.oid
        WHERE con.confrelid = 'public.orders'::regclass 
        AND con.contype = 'f' -- Foreign Key
        AND (nsp.nspname || '.' || cl.relname) = ANY(target_tables)
    LOOP
        -- Remove a constraint existente independente do nome
        EXECUTE 'ALTER TABLE public.' || r.table_name || ' DROP CONSTRAINT ' || r.conname;
        RAISE NOTICE '🗑️ Dropada constraint % da tabela % (Tipo delete anterior: %)', r.conname, r.table_name, r.confdeltype;
    END LOOP;

    RAISE NOTICE '✨ Constraints removidas. Recriando com ON DELETE CASCADE...';

    -- 1. follow_ups
    ALTER TABLE public.follow_ups 
        ADD CONSTRAINT follow_ups_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ follow_ups: CASCADE configurado.';

    -- 2. nps_feedbacks
    ALTER TABLE public.nps_feedbacks 
        ADD CONSTRAINT nps_feedbacks_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ nps_feedbacks: CASCADE configurado.';

    -- 3. technical_reports
    ALTER TABLE public.technical_reports 
        ADD CONSTRAINT technical_reports_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ technical_reports: CASCADE configurado.';

    -- 4. order_items
    ALTER TABLE public.order_items 
        ADD CONSTRAINT order_items_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ order_items: CASCADE configurado.';

    -- 5. order_logs
    ALTER TABLE public.order_logs 
        ADD CONSTRAINT order_logs_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ order_logs: CASCADE configurado.';

    -- 6. hardware_telemetry (condicional)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hardware_telemetry') THEN
        -- Remove constraint se existir (já removido no loop acima, mas por garantia)
        -- Adiciona nova
        ALTER TABLE public.hardware_telemetry 
            ADD CONSTRAINT hardware_telemetry_order_id_fkey 
            FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ hardware_telemetry: CASCADE configurado.';
    ELSE
        RAISE NOTICE '⚠️ hardware_telemetry: Tabela não encontrada, pulando.';
    END IF;

    RAISE NOTICE '🚀 Concluído! Todas as dependências de orders agora têm ON DELETE CASCADE.';
END $$;
