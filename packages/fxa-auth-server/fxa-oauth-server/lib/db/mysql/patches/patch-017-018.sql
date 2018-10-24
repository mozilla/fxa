--  Add `publicClient` column to the `clients` table.
ALTER TABLE clients ADD COLUMN publicClient BOOLEAN DEFAULT FALSE NOT NULL AFTER canGrant;
UPDATE clients SET publicClient=false;

--  Add `codeChallengeMethod` and `codeChallenge` column to the `codes` table.
ALTER TABLE codes
ADD COLUMN codeChallengeMethod VARCHAR(256) AFTER offline,
ADD COLUMN codeChallenge VARCHAR(256) AFTER codeChallengeMethod,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '18' WHERE name = 'schema-patch-level';
