-- Add stored procedures for all the general Auth DB Server operations.

-- INSERTS/REPLACES

DELIMITER $$

CREATE PROCEDURE `createAccountResetToken_2` (
    IN tokenId BINARY(32),
    IN tokenData BINARY(32),
    IN uid BINARY(16),
    IN createdAt BIGINT UNSIGNED
)
BEGIN
    -- Since we only ever want one accountResetToken per uid, then we
    -- do a replace - generally due to a collision on the unique uid field.
    REPLACE INTO accountResetTokens(
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
$$

CREATE PROCEDURE `createPasswordForgotToken_2` (
    IN tokenId BINARY(32),
    IN tokenData BINARY(32),
    IN uid BINARY(16),
    IN passCode BINARY(16),
    IN createdAt BIGINT UNSIGNED,
    IN tries SMALLINT
)
BEGIN
    -- Since we only ever want one passwordForgotToken per uid, then we
    -- do a replace - generally due to a collision on the unique uid field.
    REPLACE INTO passwordForgotTokens(
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

CREATE PROCEDURE `createPasswordChangeToken_2` (
    IN tokenId BINARY(32),
    IN tokenData BINARY(32),
    IN uid BINARY(16),
    IN createdAt BIGINT UNSIGNED
)
BEGIN
    -- Since we only ever want one passwordChangeToken per uid, then we
    -- do a replace - generally due to a collision on the unique uid field.
    REPLACE INTO passwordChangeTokens(
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
$$

-- UPDATES

CREATE PROCEDURE `forgotPasswordVerified_2` (
    IN `inPasswordForgotTokenId` BINARY(32),
    IN `inAccountResetTokenId` BINARY(32),
    IN `inTokenData` BINARY(32),
    IN `inUid` BINARY(16),
    IN `inCreatedAt` BIGINT UNSIGNED
)
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- ERROR
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    DELETE FROM passwordForgotTokens WHERE tokenId = inPasswordForgotTokenId;

    -- Since we only ever want one accountResetToken per uid, then we
    -- do a replace - generally due to a collision on the unique uid field.
    REPLACE INTO accountResetTokens(
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
$$

-- DELETES

CREATE PROCEDURE `deleteAccount_2` (
    IN `inUid` BINARY(16)
)
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- ERROR
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    DELETE FROM sessionTokens WHERE uid = inUid;
    DELETE FROM keyFetchTokens WHERE uid = inUid;
    DELETE FROM accountResetTokens WHERE uid = inUid;
    DELETE FROM passwordChangeTokens WHERE uid = inUid;
    DELETE FROM passwordForgotTokens WHERE uid = inUid;
    DELETE FROM accounts WHERE uid = inUid;

    COMMIT;

END;
$$

CREATE PROCEDURE `resetAccount_2` (
    IN `inUid` BINARY(16),
    IN `inVerifyHash` BINARY(32),
    IN `inAuthSalt` BINARY(32),
    IN `inWrapWrapKb` BINARY(32),
    IN `inVerifierSetAt` BIGINT UNSIGNED,
    IN `inVerifierVersion` TINYINT UNSIGNED
)
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- ERROR
        ROLLBACK;
        RESIGNAL;
    END;

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
$$

DELIMITER ;

UPDATE dbMetadata SET value = '7' WHERE name = 'schema-patch-level';
