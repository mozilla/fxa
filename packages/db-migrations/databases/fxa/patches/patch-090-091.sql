SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('90');

-- The `profileChangedAt` column may or may not exist in production env depending
-- on how migration 87 went. If it doesn't exist, then this statement will error because
-- you can not drop non-existent column in MySQL.
ALTER TABLE accounts DROP COLUMN profileChangedAt,
ALGORITHM = INPLACE, LOCK = NONE;

-- Removes the `profileChangedAt` update from setting primary email
CREATE PROCEDURE `setPrimaryEmail_3` (
  IN `inUid` BINARY(16),
  IN `inNormalizedEmail` VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
     UPDATE emails SET isPrimary = false WHERE uid = inUid AND isPrimary = true;
     UPDATE emails SET isPrimary = true WHERE uid = inUid AND isPrimary = false AND normalizedEmail = inNormalizedEmail;

     SELECT ROW_COUNT() INTO @updateCount;
     IF @updateCount = 0 THEN
        SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1062, MESSAGE_TEXT = 'Can not change email. Could not find email.';
     END IF;

  COMMIT;
END;

-- Removes the `profileChangedAt` update when verifying new email
CREATE PROCEDURE `verifyEmail_7`(
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
    UPDATE emails SET isVerified = true WHERE uid = inUid AND emailCode = inEmailCode;

    COMMIT;
END;

-- Removes the `profileChangedAt` update when deleting email
CREATE PROCEDURE `deleteEmail_4` (
    IN `inUid` BINARY(16),
    IN `inNormalizedEmail` VARCHAR(255)
)
BEGIN
    SET @primaryEmailCount = 0;

    -- Don't delete primary email addresses
    SELECT COUNT(*) INTO @primaryEmailCount FROM emails WHERE normalizedEmail = inNormalizedEmail AND uid = inUid AND isPrimary = true;
    IF @primaryEmailCount = 1 THEN
        SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 2100, MESSAGE_TEXT = 'Can not delete a primary email address.';
    END IF;

    DELETE FROM emails WHERE normalizedEmail = inNormalizedEmail AND uid = inUid AND isPrimary = false;
END;

-- Removes the `profileChangedAt` update when a TOTP token is deleted
CREATE PROCEDURE `deleteTotpToken_3` (
  IN `uidArg` BINARY(16)
)
BEGIN
  DELETE FROM totp WHERE uid = uidArg;
END;

-- Removes the `profileChangedAt` update when a TOTP is updated
CREATE PROCEDURE `updateTotpToken_3` (
  IN `uidArg` BINARY(16),
  IN `verifiedArg` BOOLEAN,
  IN `enabledArg` BOOLEAN
)
BEGIN
  UPDATE `totp` SET verified = verifiedArg, enabled = enabledArg WHERE uid = uidArg;
END;

-- Removes the `profileChangedAt` update when an account is reset
CREATE PROCEDURE `resetAccount_10` (
  IN `uidArg` BINARY(16),
  IN `verifyHashArg` BINARY(32),
  IN `authSaltArg` BINARY(32),
  IN `wrapWrapKbArg` BINARY(32),
  IN `verifierSetAtArg` BIGINT UNSIGNED,
  IN `VerifierVersionArg` TINYINT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DELETE FROM sessionTokens WHERE uid = uidArg;
  DELETE FROM keyFetchTokens WHERE uid = uidArg;
  DELETE FROM accountResetTokens WHERE uid = uidArg;
  DELETE FROM passwordChangeTokens WHERE uid = uidArg;
  DELETE FROM passwordForgotTokens WHERE uid = uidArg;
  DELETE FROM devices WHERE uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;

  UPDATE accounts
  SET
    verifyHash = verifyHashArg,
    authSalt = authSaltArg,
    wrapWrapKb = wrapWrapKbArg,
    verifierSetAt = verifierSetAtArg,
    verifierVersion = verifierVersionArg
  WHERE uid = uidArg;

  COMMIT;
END;

-- Coalesce `profileChangedAt` from verifierSetAt and createdAt
CREATE PROCEDURE `sessionWithDevice_17` (
  IN `tokenIdArg` BINARY(32)
)
BEGIN
  SELECT
    t.tokenData,
    t.uid,
    t.createdAt,
    t.uaBrowser,
    t.uaBrowserVersion,
    t.uaOS,
    t.uaOSVersion,
    t.uaDeviceType,
    t.uaFormFactor,
    t.lastAccessTime,
    t.verificationMethod,
    t.verifiedAt,
    COALESCE(t.authAt, t.createdAt) AS authAt,
    e.isVerified AS emailVerified,
    e.email,
    e.emailCode,
    a.verifierSetAt,
    a.locale,
    COALESCE(a.verifierSetAt, a.createdAt) AS profileChangedAt,
    a.createdAt AS accountCreatedAt,
    d.id AS deviceId,
    d.nameUtf8 AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey,
    d.callbackIsExpired AS deviceCallbackIsExpired,
    ci.commandName AS deviceCommandName,
    dc.commandData AS deviceCommandData,
    ut.tokenVerificationId,
    COALESCE(t.mustVerify, ut.mustVerify) AS mustVerify
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN emails AS e
    ON t.uid = e.uid
    AND e.isPrimary = true
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  LEFT JOIN (
    deviceCommands AS dc FORCE INDEX (PRIMARY)
    INNER JOIN deviceCommandIdentifiers AS ci FORCE INDEX (PRIMARY)
      ON ci.commandId = dc.commandId
  ) ON (dc.uid = d.uid AND dc.deviceId = d.id)
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

-- Coalesce `profileChangedAt` from verifierSetAt and createdAt
CREATE PROCEDURE `accountRecord_4` (
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
        a.authSalt,
        a.verifierSetAt,
        a.createdAt,
        a.locale,
        a.lockedAt,
        COALESCE(a.verifierSetAt, a.createdAt) AS profileChangedAt,
        e.normalizedEmail AS primaryEmail
    FROM
        accounts a,
        emails e
    WHERE
        a.uid = (SELECT uid FROM emails WHERE normalizedEmail = LOWER(inEmail))
    AND
        a.uid = e.uid
    AND
        e.isPrimary = true;
END;

-- Coalesce `profileChangedAt` from verifierSetAt and createdAt
CREATE PROCEDURE `account_5` (
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
        a.authSalt,
        a.verifierSetAt,
        a.createdAt,
        a.locale,
        a.lockedAt,
        COALESCE(a.verifierSetAt, a.createdAt) AS profileChangedAt
    FROM
        accounts a
    WHERE
        a.uid = LOWER(inUid)
    ;
END;

UPDATE dbMetadata SET value = '91' WHERE name = 'schema-patch-level';
