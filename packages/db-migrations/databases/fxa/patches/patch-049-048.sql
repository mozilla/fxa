--DROP PROCEDURE `prune_3`;

--CREATE PROCEDURE `expireSigninCodes_1` (
--  IN `olderThan` BIGINT UNSIGNED
--)
--BEGIN
--  DELETE FROM signinCodes
--  WHERE createdAt < olderThan;
--END;

--DROP PROCEDURE `consumeSigninCode_2`;

--UPDATE dbMetadata SET value = '48' WHERE name = 'schema-patch-level';
