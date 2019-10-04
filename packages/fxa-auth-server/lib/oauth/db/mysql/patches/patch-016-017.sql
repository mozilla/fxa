--  Add `lastUsedAt` column to the `refreshTokens` table.

ALTER TABLE refreshTokens ADD COLUMN lastUsedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '17' WHERE name = 'schema-patch-level';