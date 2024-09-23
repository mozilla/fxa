--  Add `currency` column to the `carts` table.
ALTER TABLE carts
ADD COLUMN currency VARCHAR(255) AFTER taxAddress,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '155' WHERE name = 'schema-patch-level';
