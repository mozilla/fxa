--SET NAMES utf8mb4 COLLATE utf8mb4_bin;

--DROP PROCEDURE `createAccountSubscription_2`;
--DROP PROCEDURE `fetchAccountSubscriptions_3`;
--DROP PROCEDURE `getAccountSubscription_2`;

--ALTER TABLE `accountSubscriptions`
--DROP COLUMN `productId`,
--ALGORITHM = INPLACE, LOCK = NONE;

--DROP INDEX accountSubscriptionsUnique2
--  ON `accountSubscriptions`
--  ALGORITHM = INPLACE LOCK = NONE;

--CREATE UNIQUE INDEX accountSubscriptionsUnique
--  ON accountSubscriptions(uid, productName, subscriptionId);

--UPDATE dbMetadata SET value = '99' WHERE name = 'schema-patch-level';
