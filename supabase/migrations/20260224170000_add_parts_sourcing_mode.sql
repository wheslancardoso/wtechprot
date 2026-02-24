-- Adiciona coluna para modalidade de compra de peças
-- Valores: 'assisted' (compra assistida), 'resale' (revenda), 'payment_link' (link de parcelamento)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS parts_sourcing_mode TEXT DEFAULT 'assisted';
