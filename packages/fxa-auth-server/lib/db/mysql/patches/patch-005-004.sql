-- Remove "termsUri" and "privacyUri" columns".
-- Remove "trusted" column, ensuring to sync with old "whitelist" column.

-- ALTER TABLE clients DROP COLUMN privacyUri;
-- ALTER TABLE clients DROP COLUMN termsUri;
-- UPDATE clients SET whitelisted=trusted;
-- ALTER TABLE clients DROP COLUMN trusted;

-- UPDATE dbMetadata SET value = '4' WHERE name = 'schema-patch-level';
