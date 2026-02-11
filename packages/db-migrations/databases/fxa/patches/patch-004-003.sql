-- -- remove these new indexes
-- ALTER TABLE `passwordChangeTokens` DROP INDEX `createdAt`;
-- ALTER TABLE `passwordForgotTokens` DROP INDEX `createdAt`;
-- ALTER TABLE `accountResetTokens` DROP INDEX `createdAt`;

-- DROP PROCEDURE `prune`;

-- -- no need for this 'prune-last-ran'
-- DELETE FROM dbMetadata WHERE name = 'prune-last-ran';

-- UPDATE dbMetadata SET value = '3' WHERE name = 'schema-patch-level';
