-- Atualiza o prazo de garantia de 90 para 180 dias para todos os tenants
UPDATE tenants SET warranty_days = 180 WHERE warranty_days = 90 OR warranty_days IS NULL;
