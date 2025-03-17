-- Rollback migration to restore the `email` column to the `carts` table.
-- Repopulates the `email` column with the email values from the `accounts` table.

ALTER TABLE carts
ADD COLUMN email VARCHAR(255) AFTER stripeSubscriptionId;

UPDATE carts c
INNER JOIN accounts a ON c.uid = a.uid
SET c.email = a.email
WHERE c.uid IS NOT NULL;

UPDATE dbMetadata SET value = '163' WHERE name = 'schema-patch-level';
