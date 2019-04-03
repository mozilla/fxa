-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- ALTER TABLE `totp`
-- DROP COLUMN `verified`,
-- DROP COLUMN `enabled`
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE `sessionTokens`
-- DROP COLUMN `verificationMethod`,
-- DROP COLUMN `verifiedAt`,
-- DROP COLUMN `mustVerify`
-- ALGORITHM = INPLACE, LOCK = NONE;

-- DROP PROCEDURE `totpToken_2`;
-- DROP PROCEDURE `updateTotpToken_1`;
-- DROP PROCEDURE `verifyTokensWithMethod_1`;
-- DROP PROCEDURE `sessionWithDevice_12`;
-- DROP PROCEDURE `createSessionToken_9`;
-- DROP PROCEDURE `updateSessionToken_3`;

-- UPDATE dbMetadata SET value = '72' WHERE name = 'schema-patch-level';

