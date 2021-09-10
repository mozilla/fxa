-- DROP INDEX unverifiedTokens_tokenVerificationCodeHash_uid;

-- ALTER TABLE `unverifiedTokens`
-- DROP COLUMN `tokenVerificationCode` BINARY(32),
-- DROP COLUMN `tokenVerificationCodeExpiresAt` BIGINT UNSIGNED,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- DROP PROCEDURE `sessionTokenWithVerificationStatus_7`;
-- DROP PROCEDURE `createSessionToken_8`;
-- DROP PROCEDURE `verifyTokenCode_1`;

-- UPDATE dbMetadata SET value = '67' WHERE name = 'schema-patch-level';

