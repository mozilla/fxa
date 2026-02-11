--  Remove refreshToken table and expiresAt column from tokens table.
--  (commented out to avoid accidentally running this in production...)

-- DROP TABLE refreshTokens;
-- ALTER TABLE tokens DROP COLUMN expiresAt;
-- ALTER TABLE codes DROP COLUMN offline;

-- UPDATE dbMetadata SET value = '5' WHERE name = 'schema-patch-level';
