-- Change clients.secret to clients.hashedSecret
-- Drop whitelisted column

ALTER TABLE clients CHANGE secret hashedSecret BINARY(32);
ALTER TABLE clients DROP COLUMN whitelisted;

UPDATE dbMetadata SET value = '7' WHERE name = 'schema-patch-level';
