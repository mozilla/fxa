SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('185');

CREATE PROCEDURE `forgotPasswordVerified_10` (
    IN `inPasswordForgotTokenId` BINARY(32),
    IN `inAccountResetTokenId` BINARY(32),
    IN `inTokenData` BINARY(32),
    IN `inUid` BINARY(16),
    IN `inCreatedAt` BIGINT UNSIGNED,
    IN `inVerificationMethod` INT
        )
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
        -- ERROR
ROLLBACK;
RESIGNAL;
END;

START TRANSACTION;

-- Pass `inVerificationMethod` to the password forgot token table
REPLACE INTO accountResetTokens(
        tokenId,
        tokenData,
        uid,
        createdAt,
        verificationMethod
    )
    VALUES(
        inAccountResetTokenId,
        inTokenData,
        inUid,
        inCreatedAt,
        inVerificationMethod
    );

UPDATE accounts SET emailVerified = true WHERE uid = inUid;
UPDATE emails SET isVerified = true, verifiedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE isPrimary = true AND uid = inUid;

COMMIT;
END;

UPDATE dbMetadata SET value = '186' WHERE name = 'schema-patch-level';
