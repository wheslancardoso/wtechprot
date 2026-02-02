-- Add problem_description column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS problem_description TEXT DEFAULT NULL;

-- Comment for clarity
COMMENT ON COLUMN orders.problem_description IS 'Original description of the problem provided by the customer/checkin';
