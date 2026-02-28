-- Drop the existing constraint on the type column
ALTER TABLE follow_ups DROP CONSTRAINT IF EXISTS follow_ups_type_check;

-- Add the new constraint with VDI 2.0 steps and legacy steps
ALTER TABLE follow_ups ADD CONSTRAINT follow_ups_type_check CHECK (
  type IN ('post_delivery', 'warranty_check', 'warranty_expiring', 'manual', 'step1_blindage', 'step2_social_proof', 'step3_authority', 'step4_new_sale')
);
