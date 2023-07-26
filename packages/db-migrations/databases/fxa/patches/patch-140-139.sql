-- ALTER TABLE `recoveryCodes` DROP COLUMN `id`;
-- ALTER TABLE `securityEvents` DROP COLUMN `id`;
-- ALTER TABLE `totp` DROP COLUMN `id`;

-- UPDATE dbMetadata SET value = '139' WHERE name = 'schema-patch-level';
