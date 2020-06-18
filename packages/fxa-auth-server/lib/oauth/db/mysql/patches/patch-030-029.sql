-- ALTER TABLE refreshTokens ADD COLUMN email VARCHAR(256) NOT NULL;
-- ALTER TABLE tokens ADD COLUMN email VARCHAR(256) NOT NULL;
-- ALTER TABLE codes ADD COLUMN email VARCHAR(256) NOT NULL;

-- UPDATE dbMetadata SET value = '29' WHERE name = 'schema-patch-level';
