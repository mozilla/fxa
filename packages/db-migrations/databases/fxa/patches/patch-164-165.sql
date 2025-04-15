SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('164');

-- Add verificationMethod to password forgot token table and account reset token table
ALTER TABLE `passwordForgotTokens` ADD COLUMN `verificationMethod` INT DEFAULT NULL, ALGORITHM = INSTANT;
ALTER TABLE `accountResetTokens` ADD COLUMN `verificationMethod` INT DEFAULT NULL, ALGORITHM = INSTANT;

-- Update passwordForgotToken procedure to return verificationMethod
CREATE PROCEDURE `passwordForgotToken_3` (
    IN `inTokenId` BINARY(32)
)
BEGIN
SELECT
    t.uid,
    t.tokenData,
    t.createdAt,
    t.passCode,
    t.tries,
    e.email,
    a.verifierSetAt,
    t.verificationMethod
FROM
    passwordForgotTokens t,
    accounts a,
    emails e
WHERE
    t.tokenId = inTokenId
  AND
    t.uid = a.uid
  AND
    t.uid = e.uid
  AND
    e.isPrimary = true
;
END;

-- Update accountResetToken procedure to return verificationMethod
CREATE PROCEDURE `accountResetToken_2` (
    IN `inTokenId` BINARY(32)
)
BEGIN
SELECT
    t.uid,
    t.tokenData,
    t.createdAt,
    a.verifierSetAt,
    t.verificationMethod
FROM
    accountResetTokens t,
    accounts a
WHERE
    t.tokenId = inTokenId
  AND
    t.uid = a.uid
;
END;

CREATE PROCEDURE `forgotPasswordVerified_9` (
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

DELETE FROM passwordForgotTokens WHERE tokenId = inPasswordForgotTokenId;

UPDATE accounts SET emailVerified = true WHERE uid = inUid;
UPDATE emails SET isVerified = true, verifiedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE isPrimary = true AND uid = inUid;

COMMIT;
END;

UPDATE dbMetadata SET value = '165' WHERE name = 'schema-patch-level';