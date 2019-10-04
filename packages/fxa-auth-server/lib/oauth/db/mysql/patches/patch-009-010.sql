-- Remove `secret` column.

ALTER TABLE clients DROP COLUMN secret;

UPDATE dbMetadata SET value = '10' WHERE name = 'schema-patch-level';
