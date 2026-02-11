CREATE PROCEDURE `createAccount_7`(
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
    IN `inLocale` VARCHAR(255)
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
        locale
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
        inLocale
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

CREATE PROCEDURE `accountEmails_2` (
    IN `inUid` BINARY(16)
)
BEGIN
    DROP TEMPORARY TABLE IF EXISTS tempUserEmails;
    CREATE TEMPORARY TABLE IF NOT EXISTS tempUserEmails AS
    (SELECT
        normalizedEmail,
        email,
        uid,
        emailCode,
        isVerified,
        isPrimary,
        verifiedAt,
        createdAt
    FROM
        emails
    WHERE
        uid = inUid);

    -- This check can be removed once the `emails` table is the source of truth for all
    -- things emails related.
    SET @hasPrimary = 0;
    SELECT COUNT(*) INTO @hasPrimary FROM tempUserEmails WHERE uid = inUid AND isPrimary = true;
    IF @hasPrimary = 0 THEN
        INSERT INTO tempUserEmails
        SELECT
            normalizedEmail,
            email,
            uid,
            emailCode,
            emailVerified AS isVerified,
            TRUE AS isPrimary,
            createdAt AS verifiedAt,
            createdAt
        FROM
            accounts a
        WHERE
            uid = inUid;
    END IF;

    SELECT * FROM tempUserEmails ORDER BY isPrimary=true DESC;
END;

CREATE PROCEDURE `forgotPasswordVerified_6` (
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
    UPDATE emails SET isVerified = true WHERE email = (SELECT email FROM accounts WHERE uid = inUid);

    COMMIT;
END;

CREATE PROCEDURE `verifyEmail_5`(
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

UPDATE dbMetadata SET value = '50' WHERE name = 'schema-patch-level';
