-- Drop all of the stored procedures we added.

-- dbMetadata
-- DROP PROCEDURE `dbMetadata_1`;

-- deletes
-- DROP PROCEDURE `resetAccount_1`;
-- DROP PROCEDURE `deletePasswordChangeToken_1`;
-- DROP PROCEDURE `deletePasswordForgotToken_1`;
-- DROP PROCEDURE `deleteAccountResetToken_1`;
-- DROP PROCEDURE `deleteKeyFetchToken_1`;
-- DROP PROCEDURE `deleteSessionToken_1`;
-- DROP PROCEDURE `deleteAccount_1`;

-- updates
-- DROP PROCEDURE `updateLocale_1`;
-- DROP PROCEDURE `forgotPasswordVerified_1`;
-- DROP PROCEDURE `verifyEmail_1`;
-- DROP PROCEDURE `updatePasswordForgotToken_1`;

-- selects
-- DROP PROCEDURE `account_1`;
-- DROP PROCEDURE `emailRecord_1`;
-- DROP PROCEDURE `passwordChangeToken_1`;
-- DROP PROCEDURE `passwordForgotToken_1`;
-- DROP PROCEDURE `accountResetToken_1`;
-- DROP PROCEDURE `keyFetchToken_1`;
-- DROP PROCEDURE `sessionToken_1`;
-- DROP PROCEDURE `accountDevices_1`;
-- DROP PROCEDURE `accountExists_1`;

-- inserts
-- DROP PROCEDURE `createPasswordChangeToken_1`;
-- DROP PROCEDURE `createPasswordForgotToken_1`;
-- DROP PROCEDURE `createAccountResetToken_1`;
-- DROP PROCEDURE `createKeyFetchToken_1`;
-- DROP PROCEDURE `createSessionToken_1`;
-- DROP PROCEDURE `createAccount_1`;

-- UPDATE dbMetadata SET value = '4' WHERE name = 'schema-patch-level';
