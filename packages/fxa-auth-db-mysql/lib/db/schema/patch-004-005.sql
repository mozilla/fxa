-- Add stored procedures for all the general Auth DB Server operations.

-- INSERTS

CREATE PROCEDURE `createAccount_1` (
    IN `uid` BINARY(16) ,
    IN `normalizedEmail` VARCHAR(255),
    IN `email` VARCHAR(255),
    IN `emailCode` BINARY(16),
    IN `emailVerified` TINYINT(1),
    IN `kA` BINARY(32),
    IN `wrapWrapKb` BINARY(32),
    IN `authSalt` BINARY(32),
    IN `verifierVersion` TINYINT UNSIGNED,
    IN `verifyHash` BINARY(32),
    IN `verifierSetAt` BIGINT UNSIGNED,
    IN `createdAt` BIGINT UNSIGNED,
    IN `locale` VARCHAR(255)
)
BEGIN
    INSERT INTO accounts(
        uid,
        normalizedEmail,
        email,
        emailCode,
        emailVerified,
        kA,
        wrapWrapKb,
        authSalt,
        verifierVersion,
        verifyHash,
        verifierSetAt,
        createdAt,
        locale
    )
    VALUES(
        uid,
        LOWER(normalizedEmail),
        email,
        emailCode,
        emailVerified,
        kA,
        wrapWrapKb,
        authSalt,
        verifierVersion,
        verifyHash,
        verifierSetAt,
        createdAt,
        locale
    );
END;

CREATE PROCEDURE `createSessionToken_1` (
    IN tokenId BINARY(32),
    IN tokenData BINARY(32),
    IN uid BINARY(16),
    IN createdAt BIGINT UNSIGNED
)
BEGIN
    INSERT INTO sessionTokens(
        tokenId,
        tokenData,
        uid,
        createdAt
    )
    VALUES(
        tokenId,
        tokenData,
        uid,
        createdAt
    );
END;

CREATE PROCEDURE `createKeyFetchToken_1` (
    IN tokenId BINARY(32),
    IN authKey BINARY(32),
    IN uid BINARY(16),
    IN keyBundle BINARY(96),
    IN createdAt BIGINT UNSIGNED
)
BEGIN
    INSERT INTO keyFetchTokens(
        tokenId,
        authKey,
        uid,
        keyBundle,
        createdAt
    )
    VALUES(
        tokenId,
        authKey,
        uid,
        keyBundle,
        createdAt
    );
END;

CREATE PROCEDURE `createAccountResetToken_1` (
    IN tokenId BINARY(32),
    IN tokenData BINARY(32),
    IN uid BINARY(16),
    IN createdAt BIGINT UNSIGNED
)
BEGIN
    INSERT INTO accountResetTokens(
        tokenId,
        tokenData,
        uid,
        createdAt
    )
    VALUES(
        tokenId,
        tokenData,
        uid,
        createdAt
    );
END;

CREATE PROCEDURE `createPasswordForgotToken_1` (
    IN tokenId BINARY(32),
    IN tokenData BINARY(32),
    IN uid BINARY(16),
    IN passCode BINARY(16),
    IN createdAt BIGINT UNSIGNED,
    IN tries SMALLINT
)
BEGIN
    INSERT INTO passwordForgotTokens(
        tokenId,
        tokenData,
        uid,
        passCode,
        createdAt,
        tries
    )
    VALUES(
        tokenId,
        tokenData,
        uid,
        passCode,
        createdAt,
        tries
    );
END;

CREATE PROCEDURE `createPasswordChangeToken_1` (
    IN tokenId BINARY(32),
    IN tokenData BINARY(32),
    IN uid BINARY(16),
    IN createdAt BIGINT UNSIGNED
)
BEGIN
    INSERT INTO passwordChangeTokens(
        tokenId,
        tokenData,
        uid,
        createdAt
    )
    VALUES(
        tokenId,
        tokenData,
        uid,
        createdAt
    );
END;

-- SELECTS

CREATE PROCEDURE `accountExists_1` (
    IN `inEmail` VARCHAR(255)
)
BEGIN
    SELECT uid FROM accounts WHERE normalizedEmail = LOWER(inEmail);
END;

CREATE PROCEDURE `accountDevices_1` (
    IN `inUid` BINARY(16)
)
BEGIN
    SELECT tokenId as id FROM sessionTokens WHERE uid = inUid;
END;

CREATE PROCEDURE `sessionToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    SELECT
        t.tokenData,
        t.uid,
        t.createdAt,
        a.emailVerified,
        a.email,
        a.emailCode,
        a.verifierSetAt,
        a.locale
    FROM
        sessionTokens t,
        accounts a
    WHERE
        t.tokenId = inTokenId
    AND
        t.uid = a.uid
    ;
END;

CREATE PROCEDURE `keyFetchToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    SELECT
        t.authKey,
        t.uid,
        t.keyBundle,
        t.createdAt,
        a.emailVerified,
        a.verifierSetAt
    FROM
        keyFetchTokens t,
        accounts a
    WHERE
        t.tokenId = inTokenId
    AND
        t.uid = a.uid
    ;
END;

CREATE PROCEDURE `accountResetToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    SELECT
        t.uid,
        t.tokenData,
        t.createdAt,
        a.verifierSetAt
    FROM
        accountResetTokens t,
        accounts a
    WHERE
        t.tokenId = inTokenId
    AND
        t.uid = a.uid
    ;
END;

CREATE PROCEDURE `passwordForgotToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    SELECT
        t.uid,
        t.tokenData,
        t.createdAt,
        t.passCode,
        t.tries,
        a.email,
        a.verifierSetAt
    FROM
        passwordForgotTokens t,
        accounts a
    WHERE
        t.tokenId = inTokenId
    AND
        t.uid = a.uid
    ;
END;

CREATE PROCEDURE `passwordChangeToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    SELECT
        t.uid,
        t.tokenData,
        t.createdAt,
        a.verifierSetAt
    FROM
        passwordChangeTokens t,
        accounts a
    WHERE
        t.tokenId = inTokenId
    AND
        t.uid = a.uid
    ;
END;

CREATE PROCEDURE `emailRecord_1` (
    IN `inEmail` VARCHAR(255)
)
BEGIN
    SELECT
        a.uid,
        a.email,
        a.normalizedEmail,
        a.emailVerified,
        a.emailCode,
        a.kA,
        a.wrapWrapKb,
        a.verifierVersion,
        a.verifyHash,
        a.authSalt,
        a.verifierSetAt
    FROM
        accounts a
    WHERE
        a.normalizedEmail = LOWER(inEmail)
    ;
END;

CREATE PROCEDURE `account_1` (
    IN `inUid` BINARY(16)
)
BEGIN
    SELECT
        a.uid,
        a.email,
        a.normalizedEmail,
        a.emailVerified,
        a.emailCode,
        a.kA,
        a.wrapWrapKb,
        a.verifierVersion,
        a.verifyHash,
        a.authSalt,
        a.verifierSetAt,
        a.createdAt,
        a.locale
    FROM
        accounts a
    WHERE
        a.uid = LOWER(inUid)
    ;
END;

-- UPDATES

CREATE PROCEDURE `updatePasswordForgotToken_1` (
    IN `inTries` SMALLINT UNSIGNED,
    IN `inTokenId` BINARY(32)
)
BEGIN
    UPDATE passwordForgotTokens SET tries = inTries WHERE tokenId = inTokenId;
END;

CREATE PROCEDURE `verifyEmail_1` (
    IN `inUid` BINARY(16)
)
BEGIN
    UPDATE accounts SET emailVerified = true WHERE uid = inUid;
END;

CREATE PROCEDURE `forgotPasswordVerified_1` (
    IN `inPasswordForgotTokenId` BINARY(32),
    IN `inAccountResetTokenId` BINARY(32),
    IN `inTokenData` BINARY(32),
    IN `inUid` BINARY(16),
    IN `inCreatedAt` BIGINT UNSIGNED
)
BEGIN

    START TRANSACTION;

    DELETE FROM passwordForgotTokens WHERE tokenId = inPasswordForgotTokenId;

    INSERT INTO accountResetTokens(
        tokenId,
        tokenData,
        uid,
        createdAt
    )
    VALUES(
        inAccountResetTokenId,
        inTokenData,
        inUid,
        inCreatedAt
    );

    UPDATE accounts SET emailVerified = true WHERE uid = inUid;

    COMMIT;

END;

CREATE PROCEDURE `updateLocale_1` (
    IN `inLocale` VARCHAR(255),
    IN `inUid` BINARY(16)
)
BEGIN
    UPDATE accounts SET locale = inLocale WHERE uid = inUid;
END;

-- DELETES

CREATE PROCEDURE `deleteAccount_1` (
    IN `inUid` BINARY(16)
)
BEGIN
    START TRANSACTION;

    DELETE FROM sessionTokens WHERE uid = inUid;
    DELETE FROM keyFetchTokens WHERE uid = inUid;
    DELETE FROM accountResetTokens WHERE uid = inUid;
    DELETE FROM passwordChangeTokens WHERE uid = inUid;
    DELETE FROM passwordForgotTokens WHERE uid = inUid;
    DELETE FROM accounts WHERE uid = inUid;

    COMMIT;
END;

CREATE PROCEDURE `deleteSessionToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    DELETE FROM sessionTokens WHERE tokenId = inTokenId;
END;

CREATE PROCEDURE `deleteKeyFetchToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    DELETE FROM keyFetchTokens WHERE tokenId = inTokenId;
END;

CREATE PROCEDURE `deleteAccountResetToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    DELETE FROM accountResetTokens WHERE tokenId = inTokenId;
END;

CREATE PROCEDURE `deletePasswordForgotToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    DELETE FROM passwordForgotTokens WHERE tokenId = inTokenId;
END;

CREATE PROCEDURE `deletePasswordChangeToken_1` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    DELETE FROM passwordChangeTokens WHERE tokenId = inTokenId;
END;

CREATE PROCEDURE `resetAccount_1` (
    IN `inUid` BINARY(16),
    IN `inVerifyHash` BINARY(32),
    IN `inAuthSalt` BINARY(32),
    IN `inWrapWrapKb` BINARY(32),
    IN `inVerifierSetAt` BIGINT UNSIGNED,
    IN `inVerifierVersion` TINYINT UNSIGNED
)
BEGIN
    START TRANSACTION;

    DELETE FROM sessionTokens WHERE uid = inUid;
    DELETE FROM keyFetchTokens WHERE uid = inUid;
    DELETE FROM accountResetTokens WHERE uid = inUid;
    DELETE FROM passwordChangeTokens WHERE uid = inUid;
    DELETE FROM passwordForgotTokens WHERE uid = inUid;

    UPDATE
        accounts
    SET
        verifyHash = inVerifyHash,
        authSalt = inAuthSalt,
        wrapWrapKb = inWrapWrapKb,
        verifierSetAt = inVerifierSetAt,
        verifierVersion = inVerifierVersion
    WHERE
        uid = inUid
    ;

    COMMIT;
END;

-- dbMetadata

CREATE PROCEDURE `dbMetadata_1` (
    IN `inName` VARCHAR(255)
)
BEGIN
    SELECT value FROM dbMetadata WHERE name = inName;
END;

UPDATE dbMetadata SET value = '5' WHERE name = 'schema-patch-level';
