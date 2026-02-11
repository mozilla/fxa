-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- ALTER TABLE `recoveryKeys`
-- ADD COLUMN recoveryKeyId
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE `recoveryKeys`
-- DROP COLUMN recoveryKeyIdHash
-- ALGORITHM = INPLACE, LOCK = NONE;

-- DROP PROCEDURE createRecoveryKey_3;
-- DROP PROCEDURE getRecoveryKey_3;

-- UPDATE dbMetadata SET value = '85' WHERE name = 'schema-patch-level';
