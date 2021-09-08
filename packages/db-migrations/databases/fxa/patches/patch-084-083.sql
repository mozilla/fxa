-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- ALTER TABLE recoveryKeys MODIFY COLUMN recoveryKeyId BINARY(64),
-- ALGORITHM = COPY, LOCK = SHARED;
-- DROP PROCEDURE createRecoveryKey_2;
-- DROP PROCEDURE getRecoveryKey_2;
-- DROP PROCEDURE deleteRecoveryKey_2;

-- UPDATE dbMetadata SET value = '83' WHERE name = 'schema-patch-level';
