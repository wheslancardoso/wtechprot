-- Execute this in Supabase SQL Editor to add the missing column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS custody_ip TEXT;

COMMENT ON COLUMN orders.custody_ip IS 'Endereço IP do dispositivo que assinou o termo de custódia';
