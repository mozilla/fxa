--SET NAMES utf8mb4 COLLATE utf8mb4_bin;

--DROP PROCEDURE `fetchAccountSubscriptions_2`;
--DROP PROCEDURE `cancelAccountSubscription_1`;

--ALTER TABLE `accountSubscriptions`
--DROP COLUMN `cancelledAt`,
--ALGORITHM = INPLACE, LOCK = NONE;

--UPDATE dbMetadata SET value = '98' WHERE name = 'schema-patch-level';
