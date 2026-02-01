-- Create table service_catalog
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

-- Enable RLS
alter table public.service_catalog enable row level security;

-- Create Policy for Tenant Isolation (Read/Write own data)
create policy "Users can view and manage their own service catalog"
    on public.service_catalog
    for all
    using (auth.uid() = tenant_id)
    with check (auth.uid() = tenant_id);

-- Seed Data (Insert initial catalog for the first found tenant - for testing purposes)
do $$
declare
    v_tenant_id uuid;
begin
    -- Try to get the first tenant ID from the tenants table
    select id into v_tenant_id from public.tenants limit 1;

    -- Only proceed if a tenant exists
    if v_tenant_id is not null then
        insert into public.service_catalog (tenant_id, name, description, category, price_min, price_max)
        values
            -- Categoria: Computadores
            (v_tenant_id, 'Formatação Industrial', 'Instalação de imagem otimizada com Macrium Reflect, Drivers atualizados e Pacote Office. Foco em performance.', 'Computadores', 160.00, 240.00),
            (v_tenant_id, 'Formatação com Backup', 'Triagem completa de arquivos do usuário, Backup seguro em nuvem/físico, Formatação e Restauração dos dados.', 'Computadores', 220.00, 320.00),
            (v_tenant_id, 'Limpeza Técnica Profunda', 'Desmontagem completa, higienização química de placa, lubrificação de cooler e troca de Pasta Térmica (Silver).', 'Computadores', 140.00, 220.00),
            (v_tenant_id, 'Upgrade de Hardware', 'Instalação física de componentes (SSD/RAM), otimização de BIOS e testes de stress.', 'Computadores', 150.00, 250.00),
            
            -- Categoria: Impressoras
            (v_tenant_id, 'Manutenção Corretiva (Jato de Tinta)', 'Desobstrução de cabeça de impressão, limpeza de dispenser (almofadas) e reset lógico.', 'Impressoras', 240.00, 280.00),
            
            -- Categoria: Diagnóstico
            (v_tenant_id, 'Visita Técnica / Diagnóstico', 'Deslocamento técnico e hora técnica para identificação da causa raiz (Abatido em caso de aprovação).', 'Diagnóstico', 70.00, 120.00);
    end if;
end $$;
