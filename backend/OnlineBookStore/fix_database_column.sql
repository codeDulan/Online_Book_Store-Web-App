-- Fix the status column length
ALTER TABLE purchases MODIFY COLUMN status VARCHAR(20) NOT NULL;

-- Check the updated column definition
DESCRIBE purchases;