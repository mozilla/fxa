-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- ALTER TABLE `passwordForgotTokens`
-- DROP COLUMN `verificationMethod`
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE `accountResetTokens`
-- DROP COLUMN `verificationMethod`
-- ALGORITHM = INPLACE, LOCK = NONE;

-- DROP PROCEDURE `passwordForgotToken_3`;
-- DROP PROCEDURE `accountResetToken_2`;
-- DROP PROCEDURE `forgotPasswordVerified_9`;

-- UPDATE dbMetadata SET value = '164' WHERE name = 'schema-patch-level';