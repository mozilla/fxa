-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- ALTER TABLE `recoveryKeys`
-- DROP COLUMN `createdAt` BIGINT,
-- DROP COLUMN `verifiedAt` BIGINT UNSIGNED,
-- DROP COLUMN `enabled` BOOLEAN,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- DROP PROCEDURE `createRecoveryKey_4`;
-- DROP PROCEDURE `getRecoveryKey_4`;
-- DROP PROCEDURE `updateRecoveryKey_1`;

-- UPDATE dbMetadata SET value = '106' WHERE name = 'schema-patch-level';
