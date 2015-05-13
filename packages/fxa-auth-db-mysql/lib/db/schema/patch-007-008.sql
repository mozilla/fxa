-- Add a lockedAt column for account locking.

ALTER TABLE accounts ADD COLUMN lockedAt BIGINT UNSIGNED DEFAULT NULL;

-- the codes to unlock an account
CREATE TABLE accountUnlockCodes (
  uid BINARY(16) PRIMARY KEY NOT NULL,
  unlockCode BINARY(16) NOT NULL
) ENGINE=InnoDB;

-- lockAccount v1
CREATE PROCEDURE `lockAccount_1` (
    IN `inUid` BINARY(16),
    IN `inUnlockCode` BINARY(16),
    IN `inLockedAt` BIGINT UNSIGNED
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- ERROR
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    UPDATE accounts SET lockedAt = inLockedAt WHERE uid = inUid;

    -- Any old values for the account should be removed
    -- before new values are inserted.
    REPLACE INTO accountUnlockCodes (
      uid,
      unlockCode
    )
    VALUES(
      inUid,
      inUnlockCode
    );

    COMMIT;
END;

-- unlockAccount v1
CREATE PROCEDURE `unlockAccount_1` (
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

    UPDATE accounts SET lockedAt = null WHERE uid = inUid;
    DELETE FROM accountUnlockCodes WHERE uid = inUid;

    COMMIT;
END;

-- unlockCode v1
CREATE PROCEDURE `unlockCode_1` (
    in `inUid` BINARY(16)
)
BEGIN
    SELECT
        uc.unlockCode
    FROM
        accountUnlockCodes uc
    WHERE
        uc.uid = LOWER(inUid)
    ;
END;

-- emailRecord v2
CREATE PROCEDURE `emailRecord_2` (
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
        a.verifierSetAt,
        a.lockedAt
    FROM
        accounts a
    WHERE
        a.normalizedEmail = LOWER(inEmail)
    ;
END;

-- account v2
CREATE PROCEDURE `account_2` (
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
        a.locale,
        a.lockedAt
    FROM
        accounts a
    WHERE
        a.uid = LOWER(inUid)
    ;
END;

-- forgotPasswordVerified v3
CREATE PROCEDURE `forgotPasswordVerified_3` (
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


    UPDATE accounts SET emailVerified = true, lockedAt = null WHERE uid = inUid;

    DELETE FROM accountUnlockCodes WHERE uid = inUid;

    COMMIT;
END;

-- deleteAccount v3
CREATE PROCEDURE `deleteAccount_3` (
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
    DELETE FROM accountUnlockCodes WHERE uid = inUid;
    DELETE FROM accounts WHERE uid = inUid;

    COMMIT;

END;

-- resetAccount v3
CREATE PROCEDURE `resetAccount_3` (
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
    DELETE FROM accountUnlockCodes WHERE uid = inUid;

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

UPDATE dbMetadata SET value = '8' WHERE name = 'schema-patch-level';
