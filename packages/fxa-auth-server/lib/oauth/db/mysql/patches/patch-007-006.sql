-- Change clients.hashedSecret to clients.secret
--  (commented out to avoid accidentally running this in production...)

-- ALTER TABLE clients CHANGE hashedSecret secret BINARY(32);
-- ALTER TABLE clients ADD COLUMN whitelisted BOOLEAN DEFAULT FALSE;
-- UPDATE clients SET whitelisted=trusted;

-- UPDATE dbMetadata SET value = '6' WHERE name = 'schema-patch-level';
