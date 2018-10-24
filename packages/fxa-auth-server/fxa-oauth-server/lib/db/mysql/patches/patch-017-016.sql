--  Drop `lastUsedAt` column to the `refreshTokens` table.

-- ALTER TABLE refreshTokens DROP COLUMN lastUsedAt,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- UPDATE dbMetadata SET value = '16' WHERE name = 'schema-patch-level';