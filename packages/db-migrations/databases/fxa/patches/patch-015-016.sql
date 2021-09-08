
-- A new table to hold a history of account lifecycle events.
-- Events are added in simple increasing auto-increment order.
CREATE TABLE openids (
    hash BINARY(32) PRIMARY KEY,
    id VARCHAR(255) NOT NULL,
    uid BINARY(16) NOT NULL,
    INDEX openid_uid (uid)
) ENGINE=InnoDB;


-- added openid
CREATE PROCEDURE `createAccount_3` (
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
    IN `locale` VARCHAR(255),
    IN `openid` VARCHAR(255),
    IN `openidHash` BINARY(32)
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

    IF openid IS NOT NULL THEN
        INSERT INTO openids(
            hash,
            id,
            uid
        )
        VALUES(
            openidHash,
            openid,
            uid
        );
    END IF;

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

CREATE PROCEDURE `openIdRecord_1` (
    IN `openidHash` BINARY(32)
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
        a.lockedAt,
        o.id as openId
    FROM
        accounts a,
        openids o
    WHERE
        o.hash = openidHash
    AND
        o.uid = a.uid
    ;
END;


CREATE PROCEDURE `deleteAccount_5` (
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
    DELETE FROM openids WHERE uid = inUid;

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


-- Schema patch-level increment.
UPDATE dbMetadata SET value = '16' WHERE name = 'schema-patch-level';
