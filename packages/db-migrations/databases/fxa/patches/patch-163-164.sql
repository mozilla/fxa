-- Remove `email` column from the `carts` table.

ALTER TABLE carts DROP COLUMN email;

UPDATE dbMetadata SET value = '164' WHERE name = 'schema-patch-level';
