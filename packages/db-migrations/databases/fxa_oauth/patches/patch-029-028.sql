-- adding the NOT NULL constraint

-- ALTER TABLE refreshTokens MODIFY COLUMN email VARCHAR(256) NOT NULL;
-- ALTER TABLE tokens MODIFY COLUMN email VARCHAR(256) NOT NULL;
-- ALTER TABLE codes MODIFY COLUMN email VARCHAR(256) NOT NULL;

-- UPDATE dbMetadata SET value = '28' WHERE name = 'schema-patch-level';
