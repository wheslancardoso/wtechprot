-- Create the 'order-evidence' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-evidence', 'order-evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;

-- Create robust policies for 'order-evidence'

-- 1. Allow public read access (SELECT)
CREATE POLICY "Public Select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'order-evidence');

-- 2. Allow public write access (INSERT) - enabling anon uploads for check-in
CREATE POLICY "Public Insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'order-evidence');

-- 3. Allow public update access (UPDATE)
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'order-evidence');
