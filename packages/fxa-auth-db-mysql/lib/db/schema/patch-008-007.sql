-- -- drop new stored procedures
-- DROP PROCEDURE `resetAccount_3`;
-- DROP PROCEDURE `deleteAccount_3`;
-- DROP PROCEDURE `forgotPasswordVerified_3`;
-- DROP PROCEDURE `account_2`;
-- DROP PROCEDURE `emailRecord_2`;
-- DROP PROCEDURE `unlockCode_1`;
-- DROP PROCEDURE `unlockAccount_1`;
-- DROP PROCEDURE `lockAccount_1`;

-- -- drop new table
-- DROP TABLE accountUnlockCodes;

-- -- drop new column
-- ALTER TABLE accounts DROP COLUMN lockedAt;

-- UPDATE dbMetadata SET value = '7' WHERE name = 'schema-patch-level';
