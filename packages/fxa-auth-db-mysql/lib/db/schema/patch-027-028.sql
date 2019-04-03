DROP PROCEDURE `openIdRecord_1`;
DROP PROCEDURE `createAccount_3`;

DROP TABLE `openids`;

-- Exact copy of `createAccount_2`, but with an updated version number
-- due to removal of `createAccount_3`.
CREATE PROCEDURE `createAccount_4` (
    IN `uid` BINARY(16) ,
    IN `normalizedEmail` VARCHAR(255),
    IN `email` VARCHAR(255),
    IN `emailCode` BINARY(16),
    IN `emailVerified` TINYINT(1),
    IN `kA` BINARY(32),
    IN `wrapWrapKb` BINARY(32),
    IN `authSalt` BINARY(32),
    IN `verifierVersion` TINYINT UNSIGNED,
    IN `verifyHash` BINARY(32),
    IN `verifierSetAt` BIGINT UNSIGNED,
    IN `createdAt` BIGINT UNSIGNED,
    IN `locale` VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

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
        locale
    )
    VALUES(
        uid,
        LOWER(normalizedEmail),
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
        locale
    );

    INSERT INTO eventLog(
        uid,
        typ,
        iat
    )
    VALUES(
        uid,
        "create",
        UNIX_TIMESTAMP()
    );

    IF emailVerified THEN
        INSERT INTO eventLog(
            uid,
            typ,
            iat
        )
        VALUES(
            uid,
            "verify",
            UNIX_TIMESTAMP()
        );
    END IF;

    COMMIT;
END;

-- Update deleteAccount to remove openid stuff
CREATE PROCEDURE `deleteAccount_8` (
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
  DELETE FROM accountUnlockCodes WHERE uid = uidArg;
  DELETE FROM accounts WHERE uid = uidArg;
  DELETE FROM devices WHERE uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;

  INSERT INTO eventLog(
    uid,
    typ,
    iat
  )
  VALUES(
    uidArg,
    "delete",
    UNIX_TIMESTAMP()
  );

  COMMIT;
END;

UPDATE dbMetadata SET value = '28' WHERE name = 'schema-patch-level';
