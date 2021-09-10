-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- DROP PROCEDURE `sessionWithDevice_18`;
-- DROP PROCEDURE `account_7`;
-- DROP PROCEDURE `accountRecord_6`;
-- DROP PROCEDURE `resetAccount_11`;
-- DROP PROCEDURE `verifyEmail_8`;
-- DROP PROCEDURE `setPrimaryEmail_6`;
-- DROP PROCEDURE `deleteEmail_5`;
-- DROP PROCEDURE `deleteTotpToken_4`;
-- DROP PROCEDURE `updateTotpToken_4`;

-- ALTER TABLE accounts DROP COLUMN profileChangedAt, DROP COLUMN keysChangedAt;

-- UPDATE dbMetadata SET value = '94' WHERE name = 'schema-patch-level';
