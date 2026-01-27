-- ==================================================
-- MIGRATION: Smart IDs (YYYY-PREFIX-SEQ)
-- ==================================================

-- 1. Create Table `tenants` (Settings per User)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  os_prefix VARCHAR(3) DEFAULT 'WT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant settings" ON tenants;
CREATE POLICY "Users can view own tenant settings" ON tenants
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own tenant settings" ON tenants;
CREATE POLICY "Users can update own tenant settings" ON tenants
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own tenant settings" ON tenants;
CREATE POLICY "Users can insert own tenant settings" ON tenants
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create tenant settings for existing users
INSERT INTO tenants (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Alter Table `orders`
-- Modify display_id from SERIAL/INT to TEXT
ALTER TABLE orders 
  ALTER COLUMN display_id DROP DEFAULT,
  ALTER COLUMN display_id SET DATA TYPE TEXT USING display_id::TEXT;

-- Add sequential_number column (to track the sequence per year/tenant)
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS sequential_number INTEGER;

-- Make display_id UNIQUE per user (not globally, to allow multi-tenant same IDs if needed, or globally unique?)
-- Ideally, it should be unique per tenant.
-- Let's make it unique per user_id + display_id just to be safe, or just globally unique string if the prefix handles collision.
-- Let's stick to unique constraint on display_id just for display purposes, but scoped by user is safer for SaaS.
-- However, user req says "2026WT-0001". If two users have "WT", they clash.
-- Ideally unique index on (user_id, display_id).
DROP INDEX IF EXISTS idx_orders_display_id_unique;
CREATE UNIQUE INDEX idx_orders_display_id_unique ON orders(user_id, display_id);


-- 3. Function to Generate Smart ID
CREATE OR REPLACE FUNCTION generate_smart_id()
RETURNS TRIGGER AS $$
DECLARE
  current_year INT;
  user_prefix VARCHAR(3);
  next_seq INTEGER;
  new_smart_id TEXT;
  tenant_record RECORD;
BEGIN
  -- Get Current Year
  current_year := EXTRACT(YEAR FROM NOW())::INT;
  
  -- Get User Prefix (Default 'WT' if not found)
  SELECT os_prefix INTO user_prefix 
  FROM tenants 
  WHERE id = NEW.user_id;
  
  IF user_prefix IS NULL THEN
    user_prefix := 'WT';
    -- Auto-create tenant record if missing
    INSERT INTO tenants (id, os_prefix) VALUES (NEW.user_id, 'WT') ON CONFLICT DO NOTHING;
  END IF;

  -- ADVISORY LOCK: Prevent race conditions for this user
  -- Cast UUID to BigInt logic or hashing for the lock key.
  -- Simpler: Lock based on user_id hash.
  PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text));

  -- Get Max Sequential Number for this User + Year
  SELECT COALESCE(MAX(sequential_number), 0) + 1 INTO next_seq
  FROM orders
  WHERE user_id = NEW.user_id
    AND EXTRACT(YEAR FROM created_at)::INT = current_year;

  -- Format Smart ID: 2026WT-0001
  new_smart_id := current_year || user_prefix || '-' || LPAD(next_seq::TEXT, 4, '0');

  -- Assign to NEW row
  NEW.sequential_number := next_seq;
  NEW.display_id := new_smart_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger
DROP TRIGGER IF EXISTS trigger_generate_smart_id ON orders;
CREATE TRIGGER trigger_generate_smart_id
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_smart_id();

-- 5. Backfill existing orders (Optional / Conditional)
-- Updates existing orders to have a display_id in formatting if they are just numbers
-- This is risky if strict history is needed, but useful for consistency.
-- Logic: If display_id is numeric (old serial), update it.
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM orders WHERE display_id ~ '^\d+$' LOOP
    -- Simple conversion for old IDs: 2024WT-{OLD_ID} based on creation date
    UPDATE orders 
    SET 
      sequential_number = rec.display_id::INT,
      display_id = EXTRACT(YEAR FROM rec.created_at) || 'WT-' || LPAD(rec.display_id::TEXT, 4, '0')
    WHERE id = rec.id;
  END LOOP;
END $$;
