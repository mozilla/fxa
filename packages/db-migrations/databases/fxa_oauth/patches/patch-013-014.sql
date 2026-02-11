-- Add hashedSecretPrevious column

ALTER TABLE clients ADD COLUMN hashedSecretPrevious BINARY(32);

UPDATE dbMetadata SET value = '14' WHERE name = 'schema-patch-level';
