alter table public.orders
add column if not exists checkout_checklist jsonb;
