-- Migration: Refine Service Catalog structure and data based on "Senior Architect" specifications.

-- 1. Ensure Table Structure matches requirements
create table if not exists public.service_catalog (
    id uuid not null default gen_random_uuid(),
    tenant_id uuid not null,
    name text not null,
    description text not null,
    price_min decimal(10,2) not null,
    price_max decimal(10,2) not null,
    category text not null,
    active boolean not null default true,
    created_at timestamp with time zone not null default now(),

    constraint service_catalog_pkey primary key (id),
    constraint service_catalog_tenant_id_fkey foreign key (tenant_id) references public.tenants(id) on delete cascade
);

-- Add 'estimated_time' column if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'service_catalog' and column_name = 'estimated_time') then
        alter table public.service_catalog add column estimated_time text;
    end if;
end $$;

-- 2. Security (RLS)
alter table public.service_catalog enable row level security;

-- Policy: Users can view and manage their own service catalog
-- (Drop first to avoid collision if re-running)
drop policy if exists "Users can view and manage their own service catalog" on public.service_catalog;

create policy "Users can view and manage their own service catalog"
    on public.service_catalog
    for all
    using (auth.uid() = tenant_id)
    with check (auth.uid() = tenant_id);

-- 3. Seed Data (Upsert logic to match exact text)
do $$
declare
    v_tenant_id uuid;
begin
    -- Get the first tenant for testing purposes
    select id into v_tenant_id from public.tenants limit 1;

    if v_tenant_id is not null then
        -- Helper temporary table to hold the desired state
        create temp table temp_catalog (
            name text,
            description text,
            price_min decimal(10,2),
            price_max decimal(10,2),
            category text,
            estimated_time text
        ) on commit drop;

        insert into temp_catalog (name, description, price_min, price_max, category, estimated_time) values
            ('Formatação Industrial', 'Instalação de imagem otimizada com Macrium Reflect, Drivers atualizados e Pacote Office. Foco em performance e estabilidade.', 160.00, 240.00, 'Computadores', '2h'),
            ('Formatação com Backup', 'Triagem completa de arquivos do usuário, Backup seguro em nuvem/físico, Formatação e Restauração dos dados na estrutura original.', 220.00, 320.00, 'Computadores', '4h'),
            ('Limpeza Técnica Profunda', 'Desmontagem completa, higienização química de placa, lubrificação de cooler e troca de Pasta Térmica (Prata/Silver) de alta condutividade.', 140.00, 220.00, 'Computadores', '2h'),
            ('Upgrade de Hardware / Montagem', 'Instalação física de componentes (SSD/RAM/GPU), cable management (organização de cabos), otimização de BIOS e testes de stress.', 150.00, 250.00, 'Computadores', '3h'),
            ('Manutenção Corretiva (Jato de Tinta)', 'Desobstrução de cabeça de impressão, limpeza de dispenser (almofadas), lubrificação de eixo e reset lógico.', 240.00, 280.00, 'Impressoras', '48h'),
            ('Visita Técnica / Diagnóstico', 'Deslocamento técnico até o local e hora técnica para identificação da causa raiz. Valor abatido caso o serviço principal seja aprovado.', 70.00, 120.00, 'Diagnóstico', '1h');

        -- Update existing records matching by Name + Tenant
        update public.service_catalog sc
        set 
            description = tc.description,
            price_min = tc.price_min,
            price_max = tc.price_max,
            category = tc.category,
            estimated_time = tc.estimated_time
        from temp_catalog tc
        where sc.name = tc.name and sc.tenant_id = v_tenant_id;

        -- Insert missing records
        insert into public.service_catalog (tenant_id, name, description, category, price_min, price_max, estimated_time)
        select v_tenant_id, tc.name, tc.description, tc.category, tc.price_min, tc.price_max, tc.estimated_time
        from temp_catalog tc
        where not exists (
            select 1 from public.service_catalog sc 
            where sc.name = tc.name and sc.tenant_id = v_tenant_id
        );

        -- Clean up other items that might not be in the official list? 
        -- Optional: Removing items that diverge significantly could be good, but safer to keep.
    end if;
end $$;
