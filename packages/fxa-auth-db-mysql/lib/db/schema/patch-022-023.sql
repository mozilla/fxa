-- This migration:
--
-- * Changes the type of the devices.callbackPublicKey column
-- * Add a new devices.callbackAuthKey column
-- * Updates the accountDevices stored procedure with the new column
-- * Alters three stored procedures, createDevice, updateDevice and
--   sessionWithDevice to work with the new columns

-- 2-steps callbackPublicKey change: we avoid junk values, and we don't block
-- concurent queries.

ALTER TABLE devices
CHANGE callbackPublicKey oldCallbackPublicKey BINARY(32),
ADD COLUMN callbackPublicKey CHAR(88),
ADD COLUMN callbackAuthKey CHAR(24),
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE devices
DROP COLUMN oldCallbackPublicKey,
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `accountDevices_4` (
  IN `inUid` BINARY(16)
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
    s.lastAccessTime
  FROM
    devices d LEFT JOIN sessionTokens s
  ON
    d.sessionTokenId = s.tokenId
  WHERE
    d.uid = inUid;
END;

CREATE PROCEDURE `createDevice_2` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inName` VARCHAR(255),
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
    name,
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
    inName,
    inType,
    inCreatedAt,
    inCallbackURL,
    inCallbackPublicKey,
    inCallbackAuthKey
  );
END;

CREATE PROCEDURE `updateDevice_2` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inName` VARCHAR(255),
  IN `inType` VARCHAR(16),
  IN `inCallbackURL` VARCHAR(255),
  IN `inCallbackPublicKey` CHAR(88),
  IN `inCallbackAuthKey` CHAR(24)
)
BEGIN
  UPDATE devices
  SET sessionTokenId = COALESCE(inSessionTokenId, sessionTokenId),
    name = COALESCE(inName, name),
    type = COALESCE(inType, type),
    callbackURL = COALESCE(inCallbackURL, callbackURL),
    callbackPublicKey = COALESCE(inCallbackPublicKey, callbackPublicKey),
    callbackAuthKey = COALESCE(inCallbackAuthKey, callbackAuthKey)
  WHERE uid = inUid AND id = inId;
END;

CREATE PROCEDURE `sessionWithDevice_2` (
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
    a.emailVerified,
    a.email,
    a.emailCode,
    a.verifierSetAt,
    a.locale,
    a.createdAt AS accountCreatedAt,
    d.id AS deviceId,
    d.name AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey
  FROM
    sessionTokens t
    LEFT JOIN accounts a ON t.uid = a.uid
    LEFT JOIN devices d ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  WHERE
    t.tokenId = inTokenId;
END;

UPDATE dbMetadata SET value = '23' WHERE name = 'schema-patch-level';
