-- UPDATE dbMetadata SET value = '143' WHERE name = 'schema-patch-level';
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('144');

ALTER TABLE fxa.accounts ADD COLUMN clientSalt VARCHAR(128);

CREATE PROCEDURE `createAccount_10`(
    IN `inUid` BINARY(16) ,
    IN `inNormalizedEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin,
    IN `inEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin,
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
    IN `inClientSalt` VARCHAR(128)
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
        clientSalt
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
        inClientSalt
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

    COMMIT;
END;



-- add clientSalt
CREATE PROCEDURE `accountRecord_10` (
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
        a.disabledAt,
        COALESCE(a.profileChangedAt, a.verifierSetAt, a.createdAt) AS profileChangedAt,
        COALESCE(a.keysChangedAt, a.verifierSetAt, a.createdAt) AS keysChangedAt,
        a.ecosystemAnonId,
        a.metricsOptOutAt,
        e.normalizedEmail AS primaryEmail,
        a.clientSalt
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


CREATE PROCEDURE `resetAccount_17` (
  IN `uidArg` BINARY(16),
  IN `verifyHashArg` BINARY(32),
  IN `authSaltArg` BINARY(32),
  IN `wrapWrapKbArg` BINARY(32),
  IN `verifierSetAtArg` BIGINT UNSIGNED,
  IN `verifierVersionArg` TINYINT UNSIGNED,
  IN `keysHaveChangedArg` BOOLEAN,
  IN `clientSaltArg` VARCHAR(128)
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
  DELETE FROM recoveryKeys WHERE uid = uidArg;
  DELETE devices, deviceCommands FROM devices LEFT JOIN deviceCommands
    ON (deviceCommands.uid = devices.uid AND deviceCommands.deviceId = devices.id)
    WHERE devices.uid = uidArg;  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  UPDATE accounts
  SET
    verifyHash = verifyHashArg,
    authSalt = authSaltArg,
    wrapWrapKb = wrapWrapKbArg,
    verifierVersion = verifierVersionArg,
    profileChangedAt = verifierSetAtArg,
    -- The `keysChangedAt` column was added in a migration, so its default value
    -- is NULL meaning "we don't know".  Now that we do know whether or not the keys
    -- are being changed, ensure it gets set to some concrete non-NULL value.
    keysChangedAt = IF(keysHaveChangedArg, verifierSetAtArg,  COALESCE(keysChangedAt, verifierSetAt, createdAt)),
    verifierSetAt = verifierSetAtArg,
    lockedAt = NULL,
    clientSalt = clientSaltArg
  WHERE uid = uidArg;

  COMMIT;
END;

UPDATE dbMetadata SET value = '145' WHERE name = 'schema-patch-level';
