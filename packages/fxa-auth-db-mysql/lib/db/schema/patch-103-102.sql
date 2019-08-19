-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- DROP PROCEDURE `fetchAccountSubscriptions_3`;
-- DROP PROCEDURE `getAccountSubscription_2`;
-- DROP PROCEDURE `createAccountSubscription_2`;

-- ALTER TABLE `accountSubscriptions`
-- DROP INDEX UQ_accountSubscriptions_uid_productId_subscriptionId,
-- DROP COLUMN productId,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- UPDATE dbMetadata SET value = '102' WHERE name = 'schema-patch-level';
