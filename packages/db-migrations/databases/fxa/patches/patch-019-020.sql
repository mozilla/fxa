-- This migration:
--
-- * Adds a column, devices.callbackPublicKey
-- * Updates the accountDevices stored procedure with the new column
-- * Adds a unique constraint on devices.uid, devices.sessionTokenId
-- * Adds two stored procedures, createDevice and updateDevice

ALTER TABLE devices
ADD COLUMN callbackPublicKey BINARY(32),
ADD CONSTRAINT UQ_devices_sessionTokenId UNIQUE (uid, sessionTokenId);

CREATE PROCEDURE `accountDevices_3` (
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

CREATE PROCEDURE `createDevice_1` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inName` VARCHAR(255),
  IN `inType` VARCHAR(16),
  IN `inCreatedAt` BIGINT UNSIGNED,
  IN `inCallbackURL` VARCHAR(255),
  IN `inCallbackPublicKey` BINARY(32)
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
    callbackPublicKey
  )
  VALUES (
    inUid,
    inId,
    inSessionTokenId,
    inName,
    inType,
    inCreatedAt,
    inCallbackURL,
    inCallbackPublicKey
  );
END;

CREATE PROCEDURE `updateDevice_1` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inName` VARCHAR(255),
  IN `inType` VARCHAR(16),
  IN `inCallbackURL` VARCHAR(255),
  IN `inCallbackPublicKey` BINARY(32)
)
BEGIN
  UPDATE devices
  SET sessionTokenId = COALESCE(inSessionTokenId, sessionTokenId),
    name = COALESCE(inName, name),
    type = COALESCE(inType, type),
    callbackURL = COALESCE(inCallbackURL, callbackURL),
    callbackPublicKey = COALESCE(inCallbackPublicKey, callbackPublicKey)
  WHERE uid = inUid AND id = inId;
END;

UPDATE dbMetadata SET value = '20' WHERE name = 'schema-patch-level';

