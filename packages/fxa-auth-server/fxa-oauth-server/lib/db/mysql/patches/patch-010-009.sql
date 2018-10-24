--  (commented out to avoid accidentally running this in production...)

-- ALTER TABLE clients ADD COLUMN secret BINARY(32);
-- UPDATE clients SET secret = hashedSecret;

-- UPDATE dbMetadata SET value = '9' WHERE name = 'schema-patch-level';
