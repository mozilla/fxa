-- drop old stored procedures

DROP PROCEDURE `createAccount_1`;

DROP PROCEDURE `account_1`;

DROP PROCEDURE `emailRecord_1`;

DROP PROCEDURE `verifyEmail_1`;

DROP PROCEDURE `forgotPasswordVerified_1`;
DROP PROCEDURE `forgotPasswordVerified_2`;
DROP PROCEDURE `forgotPasswordVerified_3`;

DROP PROCEDURE `createAccountResetToken_1`;

DROP PROCEDURE `createPasswordChangeToken_1`;

DROP PROCEDURE `createPasswordForgotToken_1`;

DROP PROCEDURE `lockAccount_1`;
DROP PROCEDURE `unlockAccount_1`;

DROP PROCEDURE `resetAccount_1`;
DROP PROCEDURE `resetAccount_2`;
DROP PROCEDURE `resetAccount_3`;

DROP PROCEDURE `deleteAccount_1`;
DROP PROCEDURE `deleteAccount_2`;
DROP PROCEDURE `deleteAccount_3`;

-- Schema patch-level increment.
UPDATE dbMetadata SET value = '12' WHERE name = 'schema-patch-level';
