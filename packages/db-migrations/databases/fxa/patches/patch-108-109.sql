-- In this migration, we are modifying procedures to set `verifiedAt` column in `emails` table
-- whenever they set the `isVerified` email column to be true

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('108');

-- Set `verifiedAt` when an email gets successfully verified.
CREATE PROCEDURE `verifyEmail_9`(
    IN `inUid` BINARY(16),
    IN `inEmailCode` BINARY(16)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    UPDATE accounts SET emailVerified = true WHERE uid = inUid AND emailCode = inEmailCode;
    UPDATE emails SET isVerified = true, verifiedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = inUid AND emailCode = inEmailCode;
    UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = inUid;

    COMMIT;
END;

CREATE PROCEDURE `forgotPasswordVerified_8` (
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

    UPDATE accounts SET emailVerified = true WHERE uid = inUid;
    UPDATE emails SET isVerified = true, verifiedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE isPrimary = true AND uid = inUid;

    COMMIT;
END;

UPDATE dbMetadata SET value = '109' WHERE name = 'schema-patch-level';
