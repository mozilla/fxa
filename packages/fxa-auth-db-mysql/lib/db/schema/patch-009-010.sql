
-- forgotPasswordVerified v4
CREATE PROCEDURE `forgotPasswordVerified_4` (
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

    DELETE FROM passwordForgotTokens WHERE tokenId = inPasswordForgotTokenId;

    DELETE FROM accountUnlockCodes WHERE uid = inUid;

    UPDATE accounts SET emailVerified = true, lockedAt = null WHERE uid = inUid;

    COMMIT;
END;

-- lockAccount v2
CREATE PROCEDURE `lockAccount_2` (
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

    UPDATE accounts SET lockedAt = inLockedAt WHERE uid = inUid;

    COMMIT;
END;

-- unlockAccount v2
CREATE PROCEDURE `unlockAccount_2` (
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

    DELETE FROM accountUnlockCodes WHERE uid = inUid;
    UPDATE accounts SET lockedAt = null WHERE uid = inUid;

    COMMIT;
END;

-- Schema patch-level increment.
UPDATE dbMetadata SET value = '10' WHERE name = 'schema-patch-level';
