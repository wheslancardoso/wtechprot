-- Follow-Up / Warranty System Migration

-- 1. Add warranty fields to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS warranty_days INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS warranty_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS warranty_end_date TIMESTAMPTZ;

-- 2. Calculate warranty dates for existing finished orders
UPDATE public.orders 
SET 
    warranty_start_date = finished_at,
    warranty_end_date = finished_at + INTERVAL '90 days'
WHERE status = 'finished' 
  AND finished_at IS NOT NULL
  AND warranty_end_date IS NULL;

-- 3. Create follow_ups table
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    
    type TEXT NOT NULL CHECK (type IN ('post_delivery', 'warranty_check', 'warranty_expiring', 'manual')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    
    scheduled_for DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    skipped_at TIMESTAMPTZ,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled ON public.follow_ups(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_follow_ups_order ON public.follow_ups(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_warranty_end ON public.orders(warranty_end_date) WHERE warranty_end_date IS NOT NULL;

-- 5. Enable RLS
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- 6. Policies
CREATE POLICY "Enable all for authenticated users" ON public.follow_ups
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Create follow-ups for existing finished orders (post_delivery 7 days after)
INSERT INTO public.follow_ups (order_id, customer_id, type, status, scheduled_for)
SELECT 
    o.id,
    o.customer_id,
    'post_delivery',
    CASE 
        WHEN o.finished_at + INTERVAL '7 days' < NOW() THEN 'skipped'
        ELSE 'pending'
    END,
    (o.finished_at + INTERVAL '7 days')::DATE
FROM public.orders o
WHERE o.status = 'finished' 
  AND o.finished_at IS NOT NULL
ON CONFLICT DO NOTHING;

-- 8. Create follow-ups for warranty expiring (7 days before end)
INSERT INTO public.follow_ups (order_id, customer_id, type, status, scheduled_for)
SELECT 
    o.id,
    o.customer_id,
    'warranty_expiring',
    CASE 
        WHEN o.warranty_end_date - INTERVAL '7 days' < NOW() THEN 'skipped'
        ELSE 'pending'
    END,
    (o.warranty_end_date - INTERVAL '7 days')::DATE
FROM public.orders o
WHERE o.status = 'finished' 
  AND o.warranty_end_date IS NOT NULL
ON CONFLICT DO NOTHING;

-- 9. Comments
COMMENT ON TABLE public.follow_ups IS 'Customer follow-up tracking for warranty and post-service care';
COMMENT ON COLUMN public.follow_ups.type IS 'post_delivery=7d after, warranty_check=mid-warranty, warranty_expiring=7d before end, manual=custom';
