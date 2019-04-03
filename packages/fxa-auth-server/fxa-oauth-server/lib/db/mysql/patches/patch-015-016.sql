-- Remove "termsUri" and "privacyUri" columns".

ALTER TABLE clients DROP COLUMN privacyUri;
ALTER TABLE clients DROP COLUMN termsUri;

UPDATE dbMetadata SET value = '16' WHERE name = 'schema-patch-level';
