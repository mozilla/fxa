-- ALTER TABLE tokens
-- DROP COLUMN profileChangedAt,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE codes
-- DROP COLUMN profileChangedAt,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE refreshTokens
-- DROP COLUMN profileChangedAt,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- UPDATE dbMetadata SET value = '21`' WHERE name = 'schema-patch-level';
