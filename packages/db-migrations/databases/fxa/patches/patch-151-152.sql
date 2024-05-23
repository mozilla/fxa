SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('151');

-- Adding index to `accounts` table to help speed up the delete unverified accounts
-- cloud scheduler job.
ALTER TABLE `accounts`
ADD INDEX `accounts_emailVerified_createdAt_idx` (`emailVerified`, `createdAt`);

UPDATE dbMetadata SET value = '152' WHERE name = 'schema-patch-level';
