-- Migration: Add seller_id column to purchase_history table
-- This migration adds the missing seller_id column that is referenced in the purchases.js route

-- Add seller_id column to purchase_history table
ALTER TABLE purchase_history 
ADD COLUMN seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add an index for better performance on seller_id queries
CREATE INDEX IF NOT EXISTS idx_purchase_history_seller_id ON purchase_history(seller_id);

-- Update existing records to set seller_id based on the listing's user_id
-- This assumes that existing purchase records should have seller_id set to the listing owner
UPDATE purchase_history 
SET seller_id = (
    SELECT pl.user_id 
    FROM pet_listings pl 
    WHERE pl.id = purchase_history.listing_id
)
WHERE seller_id IS NULL AND listing_id IS NOT NULL;

-- Add a comment to document the migration
COMMENT ON COLUMN purchase_history.seller_id IS 'ID of the seller who listed the pet (references users.id)';