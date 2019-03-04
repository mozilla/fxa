SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('94');

-- This re-instates the `profileChangedAt` column on the `accounts` table, which
-- we had briefly added and then backed out after some operational issues with
-- running the migration in production.  We've now successfully done the migration
-- in production, and this migration brings our db schema back into line with what
-- is on the live db.
--
-- It also adds a new `keysChangedAt` column which was added as part of the same
-- production migration.

ALTER TABLE accounts
  ADD COLUMN profileChangedAt BIGINT UNSIGNED DEFAULT NULL,
  ADD COLUMN keysChangedAt BIGINT UNSIGNED DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

-- Read `profileChangedAt` and `keysChangedAt` when accessing a sessionToken,
-- filling in sensible defaults if the new columns are NULL.
CREATE PROCEDURE `sessionWithDevice_18` (
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
    COALESCE(a.profileChangedAt, a.verifierSetAt, a.createdAt) AS profileChangedAt,
    COALESCE(a.keysChangedAt, a.verifierSetAt, a.createdAt) AS keysChangedAt,
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

-- Read `profileChangedAt` and `keysChangedAt` when accessing an account,
-- filling in sensible defaults if the new columns are NULL.
CREATE PROCEDURE `account_7` (
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
        COALESCE(a.profileChangedAt, a.verifierSetAt, a.createdAt) AS profileChangedAt,
        COALESCE(a.keysChangedAt, a.verifierSetAt, a.createdAt) AS keysChangedAt
    FROM
        accounts a
    WHERE
        a.uid = inUid
    ;
END;


-- Read `profileChangedAt` and `keysChangedAt` when accessing an account,
-- filling in sensible defaults if the new columns are NULL.
CREATE PROCEDURE `accountRecord_6` (
  IN `inEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin
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
        COALESCE(a.profileChangedAt, a.verifierSetAt, a.createdAt) AS profileChangedAt,
        COALESCE(a.keysChangedAt, a.verifierSetAt, a.createdAt) AS keysChangedAt,
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

-- Set `profileChangedAt` when resetting an account.
-- Note that we will *eventually* want to set `keysChangedAt` here as well,
-- but we need the auth-server to send us an explicit signal to know whether
-- or not the keys have actually changed.  That will be done in a follow-up.
CREATE PROCEDURE `resetAccount_11` (
  IN `uidArg` BINARY(16),
  IN `verifyHashArg` BINARY(32),
  IN `authSaltArg` BINARY(32),
  IN `wrapWrapKbArg` BINARY(32),
  IN `verifierSetAtArg` BIGINT UNSIGNED,
  IN `verifierVersionArg` TINYINT UNSIGNED
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
    verifierVersion = verifierVersionArg,
    profileChangedAt = verifierSetAtArg
  WHERE uid = uidArg;

  COMMIT;
END;

-- Set `profileChangedAt` when an email gets successfully verified.
CREATE PROCEDURE `verifyEmail_8`(
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
    UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = inUid;

    COMMIT;
END;


-- Set `profileChangedAt` when changing primary email.
--
-- Note that this procedure does *not* prevent setting a primary email to an unverified email.
-- The check is currently having some unexpected behavior when done here in the DB, and is instead
-- performed in the auth-server before it sets the new primary email.
-- Ref: https://github.com/mozilla/fxa-auth-server/blob/30e65674e70ee42befc1ba09b6fc0fd7dde2f608/lib/routes/emails.js#L763
CREATE PROCEDURE `setPrimaryEmail_6` (
  IN `inUid` BINARY(16),
  IN `inNormalizedEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

    SELECT normalizedEmail INTO @foundEmail FROM emails WHERE uid = inUid AND normalizedEmail = inNormalizedEmail AND isVerified;
    IF @foundEmail IS NULL THEN
     SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1062, MESSAGE_TEXT = 'Can not change email. Could not find email.';
    END IF;

    UPDATE emails SET isPrimary = false WHERE uid = inUid AND isPrimary = true;
    UPDATE emails SET isPrimary = true WHERE uid = inUid AND isPrimary = false AND normalizedEmail = inNormalizedEmail;
    UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = inUid;
  COMMIT;
END;

-- Set `profileChangedAt` when deleting an email.
CREATE PROCEDURE `deleteEmail_5` (
    IN `inUid` BINARY(16),
    IN `inNormalizedEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin
)
BEGIN
    SET @primaryEmailCount = 0;

    -- Don't delete primary email addresses
    SELECT COUNT(*) INTO @primaryEmailCount FROM emails WHERE normalizedEmail = inNormalizedEmail AND uid = inUid AND isPrimary = true;
    IF @primaryEmailCount = 1 THEN
        SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 2100, MESSAGE_TEXT = 'Can not delete a primary email address.';
    END IF;

    DELETE FROM emails WHERE normalizedEmail = inNormalizedEmail AND uid = inUid AND isPrimary = false;
    UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = inUid;
END;

-- Set `profileChangedAt` when removing TOTP from an account.
CREATE PROCEDURE `deleteTotpToken_4` (
  IN `uidArg` BINARY(16)
)
BEGIN
  DELETE FROM totp WHERE uid = uidArg;
  UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = uidArg;
END;

-- Set `profileChangedAt` when TOTP becomes active on an account.
CREATE PROCEDURE `updateTotpToken_4` (
  IN `uidArg` BINARY(16),
  IN `verifiedArg` BOOLEAN,
  IN `enabledArg` BOOLEAN
)
BEGIN
  UPDATE `totp` SET verified = verifiedArg, enabled = enabledArg WHERE uid = uidArg;
  UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = uidArg;
END;

UPDATE dbMetadata SET value = '95' WHERE name = 'schema-patch-level';
