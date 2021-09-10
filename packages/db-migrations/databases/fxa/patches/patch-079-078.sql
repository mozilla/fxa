-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- ALTER TABLE recoveryCodes MODIFY COLUMN codeHash BINARY(64),
-- ALGORITHM = COPY, LOCK = SHARED;
-- ALTER TABLE recoveryCodes DROP COLUMN salt BINARY(32),
-- ALGORITHM = COPY, LOCK = SHARED;
-- DROP recoveryCodes_1;
-- DROP consumeRecoveryCode_2;
-- DROP createRecoveryCode_2;

-- UPDATE dbMetadata SET value = '78' WHERE name = 'schema-patch-level';

