SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('111');

CREATE TABLE IF NOT EXISTS ecosystemAnonIds (
  hash BINARY(32) NOT NULL PRIMARY KEY,
  uid BINARY(16) NOT NULL,
  ecosystemAnonId TEXT CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  INDEX ecosystemAnonId_uid (uid)
) ENGINE=InnoDB;

--

CREATE PROCEDURE `getEcosystemAnonIds_1`(
  IN `inUid` BINARY(16)
)
BEGIN
  SELECT hash, ecosystemAnonId, createdAt FROM ecosystemAnonIds WHERE uid = inUid ORDER BY createdAt;
END;

--

CREATE PROCEDURE `updateEcosystemAnonId_2`(
  IN `inUid` BINARY(16),
  IN `inEcosystemAnonId` TEXT,
  IN `inCreatedAt` BIGINT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT IGNORE INTO ecosystemAnonIds(hash, uid, ecosystemAnonId, createdAt)
  VALUES (UNHEX(SHA2(inEcosystemAnonId, 256)), inUid, inEcosystemAnonId, inCreatedAt);

  UPDATE accounts SET ecosystemAnonId = inEcosystemAnonId WHERE uid = inUid;
  COMMIT;
END;

--

-- For symmetry, and to simplify testing, also update the create account stored
-- procedure to optionally allow the `ecosystemAnonId` to be set.
CREATE PROCEDURE `createAccount_9`(
    IN `inUid` BINARY(16) ,
    IN `inNormalizedEmail` VARCHAR(255),
    IN `inEmail` VARCHAR(255),
    IN `inEmailCode` BINARY(16),
    IN `inEmailVerified` TINYINT(1),
    IN `inKA` BINARY(32),
    IN `inWrapWrapKb` BINARY(32),
    IN `inAuthSalt` BINARY(32),
    IN `inVerifierVersion` TINYINT UNSIGNED,
    IN `inVerifyHash` BINARY(32),
    IN `inVerifierSetAt` BIGINT UNSIGNED,
    IN `inCreatedAt` BIGINT UNSIGNED,
    IN `inLocale` VARCHAR(255),
    IN `inEcosystemAnonId` TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Check to see if the normalizedEmail exists in the emails table before creating a new user
    -- with this email.
    SET @emailExists = 0;
    SELECT COUNT(*) INTO @emailExists FROM emails WHERE normalizedEmail = inNormalizedEmail;
    IF @emailExists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1062, MESSAGE_TEXT = 'Unable to create user, email used belongs to another user.';
    END IF;

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
        locale,
        ecosystemAnonId
    )
    VALUES(
        inUid,
        LOWER(inNormalizedEmail),
        inEmail,
        inEmailCode,
        inEmailVerified,
        inKA,
        inWrapWrapKb,
        inAuthSalt,
        inVerifierVersion,
        inVerifyHash,
        inVerifierSetAt,
        inCreatedAt,
        inLocale,
        inEcosystemAnonId
    );

    INSERT INTO emails(
        normalizedEmail,
        email,
        uid,
        emailCode,
        isVerified,
        isPrimary,
        createdAt
    )
    VALUES(
        LOWER(inNormalizedEmail),
        inEmail,
        inUid,
        inEmailCode,
        inEmailVerified,
        true,
        inCreatedAt
    );

    IF inEcosystemAnonId IS NOT NULL THEN
      INSERT IGNORE INTO ecosystemAnonIds(hash, uid, ecosystemAnonId, createdAt)
      VALUES (UNHEX(SHA2(inEcosystemAnonId, 256)), inUid, inEcosystemAnonId, inCreatedAt);
    END IF;

    COMMIT;
END;

--

CREATE PROCEDURE `deleteAccount_19` (
  IN `uidArg` BINARY(16)
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
  DELETE FROM accounts WHERE uid = uidArg;
  DELETE devices, deviceCommands FROM devices LEFT JOIN deviceCommands
    ON (deviceCommands.uid = devices.uid AND deviceCommands.deviceId = devices.id)
    WHERE devices.uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  DELETE FROM unblockCodes WHERE uid = uidArg;
  DELETE FROM emails WHERE uid = uidArg;
  DELETE FROM signinCodes WHERE uid = uidArg;
  DELETE FROM totp WHERE uid = uidArg;
  DELETE FROM recoveryKeys WHERE uid = uidArg;
  DELETE FROM recoveryCodes WHERE uid = uidArg;
  DELETE FROM securityEvents WHERE uid = uidArg;
  DELETE FROM ecosystemAnonIds WHERE uid = uidArg;

  COMMIT;
END;

--

UPDATE dbMetadata SET value = '112' WHERE name = 'schema-patch-level';
