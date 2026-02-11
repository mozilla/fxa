-- Add emails table and corresponding procedures to
-- create, get and delete them.

CREATE TABLE IF NOT EXISTS emails (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  normalizedEmail VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  uid BINARY(16) NOT NULL,
  emailCode BINARY(16) NOT NULL,
  isVerified BOOLEAN NOT NULL DEFAULT FALSE,
  isPrimary BOOLEAN NOT NULL DEFAULT FALSE,
  verifiedAt BIGINT UNSIGNED,
  createdAt BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY (`normalizedEmail`),
  INDEX `emails_uid` (`uid`)
) ENGINE=InnoDB;

CREATE PROCEDURE `createEmail_1` (
    IN `normalizedEmail` VARCHAR(255),
    IN `email` VARCHAR(255),
    IN `uid` BINARY(16) ,
    IN `emailCode` BINARY(16),
    IN `isVerified` TINYINT(1),
    IN `isPrimary` TINYINT(1),
    IN `verifiedAt` BIGINT UNSIGNED,
    IN `createdAt` BIGINT UNSIGNED
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Currently, can not add an email that is specified in the
    -- accounts table, regardless of verification state.
    SET @emailExists = 0;
    SELECT COUNT(*) INTO @emailExists FROM accounts a WHERE a.normalizedEmail = normalizedEmail;
    IF @emailExists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1062, MESSAGE_TEXT = 'Email already exists in accounts table.';
    END IF;

    INSERT INTO emails(
        normalizedEmail,
        email,
        uid,
        emailCode,
        isVerified,
        isPrimary,
        verifiedAt,
        createdAt
    )
    VALUES(
        LOWER(normalizedEmail),
        email,
        uid,
        emailCode,
        isVerified,
        isPrimary,
        verifiedAt,
        createdAt
    );

    COMMIT;
END;

CREATE PROCEDURE `accountEmails_1` (
    IN `inUid` BINARY(16)
)
BEGIN
    -- Return all emails that belong to the uid.
    -- Email from the accounts table is considered the primary email.
	(SELECT
        a.normalizedEmail,
        a.email,
        a.uid,
        a.emailCode,
        a.emailVerified AS isVerified,
        TRUE AS isPrimary,
        a.createdAt AS verifiedAt,
        a.createdAt
    FROM
        accounts a
    WHERE
        uid = inUid)

    UNION ALL

    (SELECT
        e.normalizedEmail,
        e.email,
        e.uid,
        e.emailCode,
        e.isVerified,
        e.isPrimary,
        e.verifiedAt,
        e.createdAt
    FROM
        emails e
    WHERE
        uid = inUid)
    ORDER BY createdAt;
END;

CREATE PROCEDURE `deleteEmail_1` (
    IN `inUid` BINARY(16),
    IN `inNormalizedEmail` VARCHAR(255)
)
BEGIN
    SET @deletedCount = 0;
    SET @isPrimary = 0;

    -- Don't delete any email that are considered primary emails.
    -- Since this should be the most common scenario, we try it first
    DELETE FROM emails WHERE normalizedEmail = inNormalizedEmail AND uid = inUid AND isPrimary = 0;

    -- Check to see if no rows were deleted, if this is the case, check to see if user
    -- is attempting to delete the email in the account table.
    SELECT ROW_COUNT() INTO @deletedCount;
    IF @deletedCount = 0 THEN
      SELECT COUNT(*) INTO @isPrimary FROM accounts WHERE normalizedEmail = inNormalizedEmail AND uid = inUid;

      IF @isPrimary = 1 THEN
        SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 2100, MESSAGE_TEXT = 'Can not delete a primary email address.';
      END IF;
    END IF;
END;

CREATE PROCEDURE `deleteAccount_12`(
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
  DELETE FROM devices WHERE uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  DELETE FROM unblockCodes WHERE uid = uidArg;
  DELETE FROM emails WHERE uid = uidArg;

  COMMIT;
END;


CREATE PROCEDURE `verifyEmail_4`(
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

    SET @updatedCount = 0;

    UPDATE accounts SET emailVerified = true WHERE uid = inUid AND emailCode = inEmailCode;

    SELECT ROW_COUNT() INTO @updatedCount;

    -- If no rows were updated in the accounts table, this code could
    -- belong to an email in the emails table. Attempt to verify it.
    IF @updatedCount = 0 THEN
        UPDATE emails SET isVerified = true WHERE uid = inUid AND emailCode = inEmailCode;
    END IF;

    COMMIT;
END;

CREATE PROCEDURE `createAccount_6`(
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

    COMMIT;
END;

UPDATE dbMetadata SET value = '46' WHERE name = 'schema-patch-level';