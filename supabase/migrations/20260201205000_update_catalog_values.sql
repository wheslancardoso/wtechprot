do $$
declare
    v_tenant_id uuid;
begin
    -- Get the first tenant (assuming single tenant context for now)
    select id into v_tenant_id from public.tenants limit 1;

    if v_tenant_id is not null then
        -- 1. Updates existing items to match exact terminology
        update public.service_catalog 
        set name = 'Limpeza Técnica', 
            description = 'Desmontagem + Higienização + Pasta Silver.'
        where name = 'Limpeza Técnica Profunda' and tenant_id = v_tenant_id;

        update public.service_catalog 
        set name = 'Upgrade / Montagem', 
            description = 'Instalação física + Otimização de BIOS.'
        where name = 'Upgrade de Hardware' and tenant_id = v_tenant_id;

        -- 2. Insert new Printer Services
        insert into public.service_catalog (tenant_id, name, description, category, price_min, price_max)
        select v_tenant_id, 'Manutenção Básica', 'Limpeza de roletes, sensores e ajustes.', 'Impressoras', 180.00, 240.00
        where not exists (select 1 from public.service_catalog where name = 'Manutenção Básica' and tenant_id = v_tenant_id);

        insert into public.service_catalog (tenant_id, name, description, category, price_min, price_max)
        select v_tenant_id, 'Reparo Mecânico', 'Unidade de limpeza, bomba e engrenagens.', 'Impressoras', 240.00, 320.00
        where not exists (select 1 from public.service_catalog where name = 'Reparo Mecânico' and tenant_id = v_tenant_id);

        -- Update "Manutenção Corretiva (Jato de Tinta)" to "Desobstrução / Reset"
        update public.service_catalog 
        set name = 'Desobstrução / Reset', 
            description = 'Solução química + Pressurização + Software.',
            price_min = 220.00,
            price_max = 280.00
        where name = 'Manutenção Corretiva (Jato de Tinta)' and tenant_id = v_tenant_id;

        -- 3. Update/Insert "Ponto de Equilíbrio" (Visita)
        -- Updating the seed "Visita Técnica / Diagnóstico" to match the minimum of 120
        update public.service_catalog
        set price_min = 120.00,
            price_max = 200.00, -- Estimated max based on context
            description = 'Referência mínima para deslocamento. Se o serviço for feito, esse valor é absorvido.'
        where name = 'Visita Técnica / Diagnóstico' and tenant_id = v_tenant_id;

    end if;
end $$;
