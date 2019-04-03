CREATE PROCEDURE `accountEmails_4` (
    IN `inUid` BINARY(16)
)
BEGIN
    SELECT * FROM emails WHERE uid = inUid ORDER BY isPrimary=true DESC;
END;

CREATE PROCEDURE `accountDevices_7` (
  IN `uidArg` BINARY(16)
)
BEGIN
  SELECT
    d.uid,
    d.id,
    d.sessionTokenId,
    d.name,
    d.type,
    d.createdAt,
    d.callbackURL,
    d.callbackPublicKey,
    d.callbackAuthKey,
    s.uaBrowser,
    s.uaBrowserVersion,
    s.uaOS,
    s.uaOSVersion,
    s.uaDeviceType,
    s.lastAccessTime,
    e.email
  FROM devices AS d
  INNER JOIN sessionTokens AS s
    ON d.sessionTokenId = s.tokenId
  INNER JOIN emails AS e
    ON d.uid = e.uid
  WHERE d.uid = uidArg
  AND e.isPrimary = true;
END;

CREATE PROCEDURE `accountExists_2` (
    IN `inEmail` VARCHAR(255)
)
BEGIN
    SELECT uid FROM emails WHERE normalizedEmail = LOWER(inEmail) AND isPrimary = true;
END;

CREATE PROCEDURE `consumeSigninCode_3` (
  IN `hashArg` BINARY(32),
  IN `newerThan` BIGINT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT email
  FROM emails
  WHERE uid = (
    SELECT uid
    FROM signinCodes
    WHERE hash = hashArg
	AND createdAt > newerThan
  ) AND isPrimary = true;

  DELETE FROM signinCodes
  WHERE hash = hashArg
  AND createdAt > newerThan;

  COMMIT;
END;

CREATE PROCEDURE `createEmail_2` (
    IN `normalizedEmail` VARCHAR(255),
    IN `email` VARCHAR(255),
    IN `uid` BINARY(16) ,
    IN `emailCode` BINARY(16),
    IN `isVerified` TINYINT(1),
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
        false,
        verifiedAt,
        createdAt
    );

    COMMIT;
END;

CREATE PROCEDURE `deleteEmail_2` (
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

CREATE PROCEDURE `keyFetchTokenWithVerificationStatus_2` (
  IN `tokenIdArg` BINARY(32)
)
BEGIN
  SELECT
    t.authKey,
    t.uid,
    t.keyBundle,
    t.createdAt,
    e.isVerified AS emailVerified,
    a.verifierSetAt,
    ut.tokenVerificationId
  FROM keyFetchTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN emails AS e
    ON t.uid = e.uid
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg
  AND e.isPrimary = true;
END;

CREATE PROCEDURE `passwordChangeToken_3` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    SELECT
        t.uid,
        t.tokenData,
        t.createdAt,
        a.verifierSetAt
    FROM
        passwordChangeTokens t,
        accounts a,
        emails e
    WHERE
        t.tokenId = inTokenId
    AND
        t.uid = a.uid
    AND
        t.uid = e.uid;
END;

CREATE PROCEDURE `passwordForgotToken_2` (
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
        a.verifierSetAt
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

CREATE PROCEDURE `sessionToken_4` (
    IN `inTokenId` BINARY(32)
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
        t.lastAccessTime,
        e.isVerified AS emailVerified,
        e.email,
        e.emailCode,
        a.verifierSetAt,
        a.locale,
        a.createdAt AS accountCreatedAt
    FROM
        sessionTokens t,
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

CREATE PROCEDURE `sessionTokenWithVerificationStatus_3` (
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
    t.lastAccessTime,
    e.isVerified AS emailVerified,
    e.email,
    e.emailCode,
    a.verifierSetAt,
    a.locale,
    a.createdAt AS accountCreatedAt,
    ut.tokenVerificationId,
    ut.mustVerify
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN emails AS e
    ON t.uid = e.uid
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg
  AND e.isPrimary = true;
END;

CREATE PROCEDURE `sessionWithDevice_5` (
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
    t.lastAccessTime,
    e.isVerified AS emailVerified,
    e.email,
    e.emailCode,
    a.verifierSetAt,
    a.locale,
    a.createdAt AS accountCreatedAt,
    d.id AS deviceId,
    d.name AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey,
    ut.tokenVerificationId,
    ut.mustVerify
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN emails AS e
    ON t.uid = e.uid
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg
  AND e.isPrimary = true;
END;

UPDATE dbMetadata SET value = '54' WHERE name = 'schema-patch-level';
