-- Create NPS Feedbacks table
create table public.nps_feedbacks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 10),
  comment text,
  discount_code text unique,
  is_redeemed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add unique constraint to ensure one feedback per order
alter table public.nps_feedbacks add constraint nps_feedbacks_order_id_key unique (order_id);

-- Enable RLS
alter table public.nps_feedbacks enable row level security;

-- Policies for NPS Feedbacks
-- Allow public insert (authenticated via client actions usually, but user might be anon if link is public? 
-- Assuming link /feedback/[id] is public, we might need public policy or rely on service role for the action.
-- For now, let's allow service_role key to manage everything for safety, and if we use client-side fetch, we'll need policies.
-- Given the requirement "Interface limpa... Link Link externo", likely public access needed for creation.
create policy "Enable insert for everyone" on public.nps_feedbacks for insert with check (true);
create policy "Enable read for service role only" on public.nps_feedbacks for select using (auth.role() = 'service_role');

-- Add fields to Orders table
alter table public.orders 
add column discount_amount numeric default 0,
add column coupon_code text;

-- Comment on columns
comment on column public.nps_feedbacks.score is 'Net Promoter Score (0-10)';
comment on column public.nps_feedbacks.discount_code is 'Generated code for 20% labor discount if score >= 9';
comment on column public.orders.discount_amount is 'Discount value applied to labor cost';
