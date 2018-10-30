
-- ALTER TABLE refreshTokens DROP FOREIGN KEY refreshTokens_ibfk_1,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE codes DROP FOREIGN KEY codes_ibfk_1,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE tokens DROP FOREIGN KEY tokens_ibfk_1,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- UPDATE dbMetadata SET value = '24' WHERE name = 'schema-patch-level';
