-- Drop whitelisted column

ALTER TABLE clients DROP COLUMN whitelisted;

UPDATE dbMetadata SET value = '12' WHERE name = 'schema-patch-level';
