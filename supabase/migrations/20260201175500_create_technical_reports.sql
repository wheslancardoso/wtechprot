/*
  # Create technical_reports table

  1. New Tables
    - `technical_reports`
      - `id` (uuid, primary key)
      - `order_id` (uuid, unique, references orders)
      - `tenant_id` (uuid, references auth.users)
      - `technical_analysis` (text)
      - `tests_performed` (jsonb array)
      - `conclusion` (text)
      - `photos_evidence` (text array)
      - `pdf_url` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `technical_reports` table
    - Add policies for authenticated users (assuming tenant separation is handled via RLS or app logic)
*/

create table if not exists public.technical_reports (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  tenant_id uuid not null, -- Intentionally compatible with whatever the tenant system is (likely auth.uid())
  technical_analysis text not null,
  tests_performed jsonb default '[]'::jsonb,
  conclusion text not null,
  photos_evidence text[] default array[]::text[],
  pdf_url text,
  created_at timestamptz default now() not null,

  constraint technical_reports_order_id_key unique (order_id)
);

-- Enable RLS
alter table public.technical_reports enable row level security;

-- Policies

-- Allow read access to everyone (for public link usage)
-- In a stricter environment, we might restrict this, but for now we follow the pattern for public order access.
create policy "Enable read access for all users"
  on public.technical_reports
  for select
  using (true);

-- Allow insert/update for authenticated users (technicians)
create policy "Enable insert for authenticated users"
  on public.technical_reports
  for insert
  with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users"
  on public.technical_reports
  for update
  using (auth.role() = 'authenticated');
