-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- ALTER TABLE accounts DROP COLUMN profileChangedAt, ALGORITHM = INPLACE, LOCK = NONE;

-- DROP PROCEDURE setPrimaryEmail_2;
-- DROP PROCEDURE verifyEmail_6;
-- DROP PROCEDURE deleteEmail_3;
-- DROP PROCEDURE deleteTotpToken_2;
-- DROP PROCEDURE updateTotpToken_2;
-- DROP PROCEDURE resetAccount_9;

-- DROP PROCEDURE sessionWithDevice_16;
-- DROP PROCEDURE account_4;
-- DROP PROCEDURE accountRecord_3;

-- UPDATE dbMetadata SET value = '86' WHERE name = 'schema-patch-level';
