-- Add an index to walk signinCodes table by uid,
-- which is necessary when deleting an account.
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('88');

CREATE INDEX `signinCodes_uid`
ON `signinCodes` (`uid`)
ALGORITHM = INPLACE LOCK = NONE;

UPDATE dbMetadata SET value = '89' WHERE name = 'schema-patch-level';
