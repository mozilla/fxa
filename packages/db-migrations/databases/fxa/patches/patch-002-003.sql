-- add locale to accounts table

ALTER TABLE accounts ADD COLUMN locale VARCHAR(255);

UPDATE dbMetadata SET value = '3' WHERE name = 'schema-patch-level';
