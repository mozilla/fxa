--  Drop `publicClient` column from the `clients` table.

-- ALTER TABLE clients DROP COLUMN publicClient,
-- ALGORITHM = INPLACE, LOCK = NONE;

--  Drop `codeChallengeMethod` and `codeChallenge` column from the `codes` table.

-- ALTER TABLE codes DROP COLUMN codeChallengeMethod,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE codes DROP COLUMN codeChallenge,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- UPDATE dbMetadata SET value = '17' WHERE name = 'schema-patch-level';
