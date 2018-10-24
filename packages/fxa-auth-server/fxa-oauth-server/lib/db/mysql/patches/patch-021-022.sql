-- Add column to stash the `profileChangedAt` value
ALTER TABLE codes ADD COLUMN profileChangedAt BIGINT DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE tokens ADD COLUMN profileChangedAt BIGINT DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE refreshTokens ADD COLUMN profileChangedAt BIGINT DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '22' WHERE name = 'schema-patch-level';
