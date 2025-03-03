SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('163');

-- Add verificationMethod to password forgot token table and account reset token table
ALTER TABLE `passwordForgotTokens` ADD COLUMN `verificationMethod` INT DEFAULT NULL ALGORITHM = INPLACE, LOCK = NONE;
ALTER TABLE `accountResetTokens` ADD COLUMN `verificationMethod` INT DEFAULT NULL ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '164' WHERE name = 'schema-patch-level';
