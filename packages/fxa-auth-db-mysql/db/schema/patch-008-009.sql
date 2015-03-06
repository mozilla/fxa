
-- A new table to hold a history of account lifecycle events.
-- Events are added in simple increasing auto-increment order.
CREATE TABLE eventLog (
  pos BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  uid BINARY(16) NOT NULL,
  typ ENUM('create', 'verify', 'reset', 'delete') NOT NULL,
  iat INT UNSIGNED NOT NULL
) ENGINE=InnoDB;


-- When an account is created, log a "create" event.
-- Pre-verified accounts may also get a "verify" event.
CREATE PROCEDURE `createAccount_2` (
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


-- When an email is verified, log a "verify" event.
CREATE PROCEDURE `verifyEmail_2` (
    IN `inUid` BINARY(16)
)
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    UPDATE accounts SET emailVerified = true WHERE uid = inUid;

    INSERT INTO eventLog(
        uid,
        typ,
        iat
    )
    VALUES(
        inUid,
        "verify",
        UNIX_TIMESTAMP()
    );

    COMMIT;
END;


-- When an account is reset, log a "reset" event.
CREATE PROCEDURE `resetAccount_4` (
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

    INSERT INTO eventLog(
        uid,
        typ,
        iat
    )
    VALUES(
        inUid,
        "reset",
        UNIX_TIMESTAMP()
    );

    COMMIT;
END;


-- When an account is deleted, log a "delete" event.
CREATE PROCEDURE `deleteAccount_4` (
    IN `inUid` BINARY(16)
)
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
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

    INSERT INTO eventLog(
        uid,
        typ,
        iat
    )
    VALUES(
        inUid,
        "delete",
        UNIX_TIMESTAMP()
    );

    COMMIT;

END;


-- A helper for reading out of the eventlog.
-- Likely only useful for testing purposes.
CREATE PROCEDURE `getEventsSincePosition_1` (
    IN `inPos` BIGINT UNSIGNED
)
BEGIN
    SELECT pos, uid, typ, iat
    FROM eventLog
    WHERE pos > inPos
    ORDER BY pos ASC
    LIMIT 100;
END;


-- Schema patch-level increment.
UPDATE dbMetadata SET value = '9' WHERE name = 'schema-patch-level';
