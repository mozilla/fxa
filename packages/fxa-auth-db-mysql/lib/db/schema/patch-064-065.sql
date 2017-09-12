SET NAMES utf8mb4 COLLATE utf8mb4_bin;

UPDATE devices SET nameUtf8 = name WHERE nameUtf8 IS NULL;

CREATE PROCEDURE `accountDevices_12` (
  IN `uidArg` BINARY(16)
)
BEGIN
  SELECT
    d.uid,
    d.id,
    d.sessionTokenId,
    d.nameUtf8 AS name,
    d.type,
    d.createdAt,
    d.callbackURL,
    d.callbackPublicKey,
    d.callbackAuthKey,
    d.callbackIsExpired,
    s.uaBrowser,
    s.uaBrowserVersion,
    s.uaOS,
    s.uaOSVersion,
    s.uaDeviceType,
    s.uaFormFactor,
    s.lastAccessTime,
    e.email
  FROM devices AS d
  INNER JOIN sessionTokens AS s
    ON d.sessionTokenId = s.tokenId
  INNER JOIN emails AS e
    ON d.uid = e.uid
    AND e.isPrimary = true
  WHERE d.uid = uidArg;
END;

CREATE PROCEDURE `updateDevice_5` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inNameUtf8` VARCHAR(255),
  IN `inType` VARCHAR(16),
  IN `inCallbackURL` VARCHAR(255),
  IN `inCallbackPublicKey` CHAR(88),
  IN `inCallbackAuthKey` CHAR(24),
  IN `inCallbackIsExpired` BOOLEAN
)
BEGIN
  UPDATE devices
  SET sessionTokenId = COALESCE(inSessionTokenId, sessionTokenId),
    nameUtf8 = COALESCE(inNameUtf8, nameUtf8),
    type = COALESCE(inType, type),
    callbackURL = COALESCE(inCallbackURL, callbackURL),
    callbackPublicKey = COALESCE(inCallbackPublicKey, callbackPublicKey),
    callbackAuthKey = COALESCE(inCallbackAuthKey, callbackAuthKey),
    callbackIsExpired = COALESCE(inCallbackIsExpired, callbackIsExpired)
  WHERE uid = inUid AND id = inId;
END;

CREATE PROCEDURE `deviceFromTokenVerificationId_3` (
    IN inUid BINARY(16),
    IN inTokenVerificationId BINARY(16)
)
BEGIN
    SELECT
        d.id,
        d.nameUtf8 AS name,
        d.type,
        d.createdAt,
        d.callbackURL,
        d.callbackPublicKey,
        d.callbackAuthKey,
        d.callbackIsExpired
    FROM unverifiedTokens AS u
    INNER JOIN devices AS d
        ON (u.tokenId = d.sessionTokenId AND u.uid = d.uid)
    WHERE u.uid = inUid AND u.tokenVerificationId = inTokenVerificationId;
END;


CREATE PROCEDURE `sessions_7` (
  IN `uidArg` BINARY(16)
)
BEGIN
  SELECT
    t.tokenId,
    t.uid,
    t.createdAt,
    t.uaBrowser,
    t.uaBrowserVersion,
    t.uaOS,
    t.uaOSVersion,
    t.uaDeviceType,
    t.uaFormFactor,
    t.lastAccessTime,
    d.id AS deviceId,
    d.nameUtf8 AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey,
    d.callbackIsExpired AS deviceCallbackIsExpired
  FROM sessionTokens AS t
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  WHERE t.uid = uidArg;
END;


CREATE PROCEDURE `sessionWithDevice_10` (
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
    e.isVerified AS emailVerified,
    e.email,
    e.emailCode,
    a.verifierSetAt,
    a.locale,
    a.createdAt AS accountCreatedAt,
    d.id AS deviceId,
    d.nameUtf8 AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey,
    d.callbackIsExpired AS deviceCallbackIsExpired,
    ut.tokenVerificationId,
    ut.mustVerify
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN emails AS e
    ON t.uid = e.uid
    AND e.isPrimary = true
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;


CREATE PROCEDURE `createDevice_4` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inNameUtf8` VARCHAR(255),
  IN `inType` VARCHAR(16),
  IN `inCreatedAt` BIGINT UNSIGNED,
  IN `inCallbackURL` VARCHAR(255),
  IN `inCallbackPublicKey` CHAR(88),
  IN `inCallbackAuthKey` CHAR(24)
)
BEGIN
  INSERT INTO devices(
    uid,
    id,
    sessionTokenId,
    nameUtf8,
    type,
    createdAt,
    callbackURL,
    callbackPublicKey,
    callbackAuthKey
  )
  VALUES (
    inUid,
    inId,
    inSessionTokenId,
    inNameUtf8,
    inType,
    inCreatedAt,
    inCallbackURL,
    inCallbackPublicKey,
    inCallbackAuthKey
  );
END;

UPDATE dbMetadata SET value = '65' WHERE name = 'schema-patch-level';

