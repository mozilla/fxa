--  (commented out to avoid accidentally running this in production...)

-- ALTER TABLE clients ADD COLUMN whitelisted BOOLEAN DEFAULT FALSE;
-- UPDATE clients SET whitelisted=trusted;

-- UPDATE dbMetadata SET value = '11' WHERE name = 'schema-patch-level';
