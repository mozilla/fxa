SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CREATE TABLE IF NOT EXISTS deviceCapabilities (
  uid BINARY(16) NOT NULL,
  deviceId BINARY(16) NOT NULL,
  capability TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (uid, deviceId, capability),
  FOREIGN KEY (uid, deviceId) REFERENCES devices(uid, id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE PROCEDURE `addCapability_1` (
  IN `inUid` BINARY(16),
  IN `inDeviceId` BINARY(16),
  IN `inCapability` TINYINT UNSIGNED
)
BEGIN
  INSERT INTO deviceCapabilities(
    uid,
    deviceId,
    capability
  )
  VALUES (
    inUid,
    inDeviceId,
    inCapability
  );
END;

CREATE PROCEDURE `purgeCapabilities_1` (
  IN `inUid` BINARY(16),
  IN `inDeviceId` BINARY(16)
)
BEGIN
  DELETE FROM deviceCapabilities WHERE uid = inUid AND deviceId = inDeviceId;
END;

CREATE PROCEDURE `accountDevices_13` (
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
    (SELECT GROUP_CONCAT(dc.capability)
     FROM deviceCapabilities dc
     WHERE dc.uid = d.uid AND dc.deviceId = d.id) AS capabilities,
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

CREATE PROCEDURE `deviceFromTokenVerificationId_4` (
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
        d.callbackIsExpired,
        (SELECT GROUP_CONCAT(dc.capability)
         FROM deviceCapabilities dc
         WHERE dc.uid = d.uid AND dc.deviceId = d.id) AS capabilities
    FROM unverifiedTokens AS u
    INNER JOIN devices AS d
        ON (u.tokenId = d.sessionTokenId AND u.uid = d.uid)
    WHERE u.uid = inUid AND u.tokenVerificationId = inTokenVerificationId;
END;


CREATE PROCEDURE `sessionWithDevice_13` (
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
    a.createdAt AS accountCreatedAt,
    d.id AS deviceId,
    d.nameUtf8 AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey,
    d.callbackIsExpired AS deviceCallbackIsExpired,
    (SELECT GROUP_CONCAT(dc.capability)
     FROM deviceCapabilities dc
     WHERE dc.uid = d.uid AND dc.deviceId = d.id) AS deviceCapabilities,
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
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

CREATE PROCEDURE `sessions_9` (
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
    COALESCE(t.authAt, t.createdAt) AS authAt,
    d.id AS deviceId,
    d.nameUtf8 AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey,
    d.callbackIsExpired AS deviceCallbackIsExpired,
    (SELECT GROUP_CONCAT(dc.capability)
     FROM deviceCapabilities dc
     WHERE dc.uid = d.uid AND dc.deviceId = d.id) AS deviceCapabilities
  FROM sessionTokens AS t
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  WHERE t.uid = uidArg;
END;

UPDATE dbMetadata SET value = '74' WHERE name = 'schema-patch-level';
