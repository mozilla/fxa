-- -- Recreating the stored procedures we have dropped (in reverse order).

-- CREATE PROCEDURE `deleteAccount_3` (
--     IN `inUid` BINARY(16)
-- )
-- BEGIN

--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         -- ERROR
--         ROLLBACK;
--         RESIGNAL;
--     END;

--     START TRANSACTION;

--     DELETE FROM sessionTokens WHERE uid = inUid;
--     DELETE FROM keyFetchTokens WHERE uid = inUid;
--     DELETE FROM accountResetTokens WHERE uid = inUid;
--     DELETE FROM passwordChangeTokens WHERE uid = inUid;
--     DELETE FROM passwordForgotTokens WHERE uid = inUid;
--     DELETE FROM accountUnlockCodes WHERE uid = inUid;
--     DELETE FROM accounts WHERE uid = inUid;

--     COMMIT;

-- END;

-- CREATE PROCEDURE `deleteAccount_2` (
--     IN `inUid` BINARY(16)
-- )
-- BEGIN

--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         -- ERROR
--         ROLLBACK;
--         RESIGNAL;
--     END;

--     START TRANSACTION;

--     DELETE FROM sessionTokens WHERE uid = inUid;
--     DELETE FROM keyFetchTokens WHERE uid = inUid;
--     DELETE FROM accountResetTokens WHERE uid = inUid;
--     DELETE FROM passwordChangeTokens WHERE uid = inUid;
--     DELETE FROM passwordForgotTokens WHERE uid = inUid;
--     DELETE FROM accounts WHERE uid = inUid;

--     COMMIT;

-- END;

-- CREATE PROCEDURE `deleteAccount_1` (
--     IN `inUid` BINARY(16)
-- )
-- BEGIN
--     START TRANSACTION;

--     DELETE FROM sessionTokens WHERE uid = inUid;
--     DELETE FROM keyFetchTokens WHERE uid = inUid;
--     DELETE FROM accountResetTokens WHERE uid = inUid;
--     DELETE FROM passwordChangeTokens WHERE uid = inUid;
--     DELETE FROM passwordForgotTokens WHERE uid = inUid;
--     DELETE FROM accounts WHERE uid = inUid;

--     COMMIT;
-- END;

-- CREATE PROCEDURE `resetAccount_3` (
--     IN `inUid` BINARY(16),
--     IN `inVerifyHash` BINARY(32),
--     IN `inAuthSalt` BINARY(32),
--     IN `inWrapWrapKb` BINARY(32),
--     IN `inVerifierSetAt` BIGINT UNSIGNED,
--     IN `inVerifierVersion` TINYINT UNSIGNED
-- )
-- BEGIN

--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         -- ERROR
--         ROLLBACK;
--         RESIGNAL;
--     END;

--     START TRANSACTION;

--     DELETE FROM sessionTokens WHERE uid = inUid;
--     DELETE FROM keyFetchTokens WHERE uid = inUid;
--     DELETE FROM accountResetTokens WHERE uid = inUid;
--     DELETE FROM passwordChangeTokens WHERE uid = inUid;
--     DELETE FROM passwordForgotTokens WHERE uid = inUid;
--     DELETE FROM accountUnlockCodes WHERE uid = inUid;

--     UPDATE
--         accounts
--     SET
--         verifyHash = inVerifyHash,
--         authSalt = inAuthSalt,
--         wrapWrapKb = inWrapWrapKb,
--         verifierSetAt = inVerifierSetAt,
--         verifierVersion = inVerifierVersion
--     WHERE
--         uid = inUid
--     ;

--     COMMIT;
-- END;

-- CREATE PROCEDURE `resetAccount_2` (
--     IN `inUid` BINARY(16),
--     IN `inVerifyHash` BINARY(32),
--     IN `inAuthSalt` BINARY(32),
--     IN `inWrapWrapKb` BINARY(32),
--     IN `inVerifierSetAt` BIGINT UNSIGNED,
--     IN `inVerifierVersion` TINYINT UNSIGNED
-- )
-- BEGIN

--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         -- ERROR
--         ROLLBACK;
--         RESIGNAL;
--     END;

--     START TRANSACTION;

--     DELETE FROM sessionTokens WHERE uid = inUid;
--     DELETE FROM keyFetchTokens WHERE uid = inUid;
--     DELETE FROM accountResetTokens WHERE uid = inUid;
--     DELETE FROM passwordChangeTokens WHERE uid = inUid;
--     DELETE FROM passwordForgotTokens WHERE uid = inUid;

--     UPDATE
--         accounts
--     SET
--         verifyHash = inVerifyHash,
--         authSalt = inAuthSalt,
--         wrapWrapKb = inWrapWrapKb,
--         verifierSetAt = inVerifierSetAt,
--         verifierVersion = inVerifierVersion
--     WHERE
--         uid = inUid
--     ;

--     COMMIT;

-- END;

-- CREATE PROCEDURE `resetAccount_1` (
--     IN `inUid` BINARY(16),
--     IN `inVerifyHash` BINARY(32),
--     IN `inAuthSalt` BINARY(32),
--     IN `inWrapWrapKb` BINARY(32),
--     IN `inVerifierSetAt` BIGINT UNSIGNED,
--     IN `inVerifierVersion` TINYINT UNSIGNED
-- )
-- BEGIN
--     START TRANSACTION;

--     DELETE FROM sessionTokens WHERE uid = inUid;
--     DELETE FROM keyFetchTokens WHERE uid = inUid;
--     DELETE FROM accountResetTokens WHERE uid = inUid;
--     DELETE FROM passwordChangeTokens WHERE uid = inUid;
--     DELETE FROM passwordForgotTokens WHERE uid = inUid;

--     UPDATE
--         accounts
--     SET
--         verifyHash = inVerifyHash,
--         authSalt = inAuthSalt,
--         wrapWrapKb = inWrapWrapKb,
--         verifierSetAt = inVerifierSetAt,
--         verifierVersion = inVerifierVersion
--     WHERE
--         uid = inUid
--     ;

--     COMMIT;
-- END;

-- CREATE PROCEDURE `unlockAccount_1` (
--     IN `inUid` BINARY(16)
-- )
-- BEGIN
--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         -- ERROR
--         ROLLBACK;
--         RESIGNAL;
--     END;

--     START TRANSACTION;

--     UPDATE accounts SET lockedAt = null WHERE uid = inUid;
--     DELETE FROM accountUnlockCodes WHERE uid = inUid;

--     COMMIT;
-- END;

-- CREATE PROCEDURE `lockAccount_1` (
--     IN `inUid` BINARY(16),
--     IN `inUnlockCode` BINARY(16),
--     IN `inLockedAt` BIGINT UNSIGNED
-- )
-- BEGIN
--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         -- ERROR
--         ROLLBACK;
--         RESIGNAL;
--     END;

--     START TRANSACTION;

--     UPDATE accounts SET lockedAt = inLockedAt WHERE uid = inUid;

--     -- Any old values for the account should be removed
--     -- before new values are inserted.
--     REPLACE INTO accountUnlockCodes (
--       uid,
--       unlockCode
--     )
--     VALUES(
--       inUid,
--       inUnlockCode
--     );

--     COMMIT;
-- END;

-- CREATE PROCEDURE `createPasswordForgotToken_1` (
--     IN tokenId BINARY(32),
--     IN tokenData BINARY(32),
--     IN uid BINARY(16),
--     IN passCode BINARY(16),
--     IN createdAt BIGINT UNSIGNED,
--     IN tries SMALLINT
-- )
-- BEGIN
--     INSERT INTO passwordForgotTokens(
--         tokenId,
--         tokenData,
--         uid,
--         passCode,
--         createdAt,
--         tries
--     )
--     VALUES(
--         tokenId,
--         tokenData,
--         uid,
--         passCode,
--         createdAt,
--         tries
--     );
-- END;

-- CREATE PROCEDURE `createPasswordChangeToken_1` (
--     IN tokenId BINARY(32),
--     IN tokenData BINARY(32),
--     IN uid BINARY(16),
--     IN createdAt BIGINT UNSIGNED
-- )
-- BEGIN
--     INSERT INTO passwordChangeTokens(
--         tokenId,
--         tokenData,
--         uid,
--         createdAt
--     )
--     VALUES(
--         tokenId,
--         tokenData,
--         uid,
--         createdAt
--     );
-- END;

-- CREATE PROCEDURE `createAccountResetToken_1` (
--     IN tokenId BINARY(32),
--     IN tokenData BINARY(32),
--     IN uid BINARY(16),
--     IN createdAt BIGINT UNSIGNED
-- )
-- BEGIN
--     INSERT INTO accountResetTokens(
--         tokenId,
--         tokenData,
--         uid,
--         createdAt
--     )
--     VALUES(
--         tokenId,
--         tokenData,
--         uid,
--         createdAt
--     );
-- END;

-- CREATE PROCEDURE `forgotPasswordVerified_3` (
--     IN `inPasswordForgotTokenId` BINARY(32),
--     IN `inAccountResetTokenId` BINARY(32),
--     IN `inTokenData` BINARY(32),
--     IN `inUid` BINARY(16),
--     IN `inCreatedAt` BIGINT UNSIGNED
-- )
-- BEGIN
--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         -- ERROR
--         ROLLBACK;
--         RESIGNAL;
--     END;

--     START TRANSACTION;

--     DELETE FROM passwordForgotTokens WHERE tokenId = inPasswordForgotTokenId;

--     -- Since we only ever want one accountResetToken per uid, then we
--     -- do a replace - generally due to a collision on the unique uid field.
--     REPLACE INTO accountResetTokens(
--         tokenId,
--         tokenData,
--         uid,
--         createdAt
--     )
--     VALUES(
--         inAccountResetTokenId,
--         inTokenData,
--         inUid,
--         inCreatedAt
--     );


--     UPDATE accounts SET emailVerified = true, lockedAt = null WHERE uid = inUid;

--     DELETE FROM accountUnlockCodes WHERE uid = inUid;

--     COMMIT;
-- END;

-- CREATE PROCEDURE `forgotPasswordVerified_2` (
--     IN `inPasswordForgotTokenId` BINARY(32),
--     IN `inAccountResetTokenId` BINARY(32),
--     IN `inTokenData` BINARY(32),
--     IN `inUid` BINARY(16),
--     IN `inCreatedAt` BIGINT UNSIGNED
-- )
-- BEGIN

--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         -- ERROR
--         ROLLBACK;
--         RESIGNAL;
--     END;

--     START TRANSACTION;

--     DELETE FROM passwordForgotTokens WHERE tokenId = inPasswordForgotTokenId;

--     -- Since we only ever want one accountResetToken per uid, then we
--     -- do a replace - generally due to a collision on the unique uid field.
--     REPLACE INTO accountResetTokens(
--         tokenId,
--         tokenData,
--         uid,
--         createdAt
--     )
--     VALUES(
--         inAccountResetTokenId,
--         inTokenData,
--         inUid,
--         inCreatedAt
--     );

--     UPDATE accounts SET emailVerified = true WHERE uid = inUid;

--     COMMIT;

-- END;

-- CREATE PROCEDURE `forgotPasswordVerified_1` (
--     IN `inPasswordForgotTokenId` BINARY(32),
--     IN `inAccountResetTokenId` BINARY(32),
--     IN `inTokenData` BINARY(32),
--     IN `inUid` BINARY(16),
--     IN `inCreatedAt` BIGINT UNSIGNED
-- )
-- BEGIN

--     START TRANSACTION;

--     DELETE FROM passwordForgotTokens WHERE tokenId = inPasswordForgotTokenId;

--     INSERT INTO accountResetTokens(
--         tokenId,
--         tokenData,
--         uid,
--         createdAt
--     )
--     VALUES(
--         inAccountResetTokenId,
--         inTokenData,
--         inUid,
--         inCreatedAt
--     );

--     UPDATE accounts SET emailVerified = true WHERE uid = inUid;

--     COMMIT;

-- END;

-- CREATE PROCEDURE `verifyEmail_1` (
--     IN `inUid` BINARY(16)
-- )
-- BEGIN
--     UPDATE accounts SET emailVerified = true WHERE uid = inUid;
-- END;

-- CREATE PROCEDURE `emailRecord_1` (
--     IN `inEmail` VARCHAR(255)
-- )
-- BEGIN
--     SELECT
--         a.uid,
--         a.email,
--         a.normalizedEmail,
--         a.emailVerified,
--         a.emailCode,
--         a.kA,
--         a.wrapWrapKb,
--         a.verifierVersion,
--         a.verifyHash,
--         a.authSalt,
--         a.verifierSetAt
--     FROM
--         accounts a
--     WHERE
--         a.normalizedEmail = LOWER(inEmail)
--     ;
-- END;

-- CREATE PROCEDURE `account_1` (
--     IN `inUid` BINARY(16)
-- )
-- BEGIN
--     SELECT
--         a.uid,
--         a.email,
--         a.normalizedEmail,
--         a.emailVerified,
--         a.emailCode,
--         a.kA,
--         a.wrapWrapKb,
--         a.verifierVersion,
--         a.verifyHash,
--         a.authSalt,
--         a.verifierSetAt,
--         a.createdAt,
--         a.locale
--     FROM
--         accounts a
--     WHERE
--         a.uid = LOWER(inUid)
--     ;
-- END;

-- CREATE PROCEDURE `createAccount_1` (
--     IN `uid` BINARY(16) ,
--     IN `normalizedEmail` VARCHAR(255),
--     IN `email` VARCHAR(255),
--     IN `emailCode` BINARY(16),
--     IN `emailVerified` TINYINT(1),
--     IN `kA` BINARY(32),
--     IN `wrapWrapKb` BINARY(32),
--     IN `authSalt` BINARY(32),
--     IN `verifierVersion` TINYINT UNSIGNED,
--     IN `verifyHash` BINARY(32),
--     IN `verifierSetAt` BIGINT UNSIGNED,
--     IN `createdAt` BIGINT UNSIGNED,
--     IN `locale` VARCHAR(255)
-- )
-- BEGIN
--     INSERT INTO accounts(
--         uid,
--         normalizedEmail,
--         email,
--         emailCode,
--         emailVerified,
--         kA,
--         wrapWrapKb,
--         authSalt,
--         verifierVersion,
--         verifyHash,
--         verifierSetAt,
--         createdAt,
--         locale
--     )
--     VALUES(
--         uid,
--         LOWER(normalizedEmail),
--         email,
--         emailCode,
--         emailVerified,
--         kA,
--         wrapWrapKb,
--         authSalt,
--         verifierVersion,
--         verifyHash,
--         verifierSetAt,
--         createdAt,
--         locale
--     );
-- END;

-- -- Schema patch-level increment.
-- UPDATE dbMetadata SET value = '11' WHERE name = 'schema-patch-level';
