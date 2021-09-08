-- Add hashedSecret column, to replace secret column.

ALTER TABLE clients ADD COLUMN hashedSecret BINARY(32);
UPDATE clients SET hashedSecret = secret;

UPDATE dbMetadata SET value = '9' WHERE name = 'schema-patch-level';
