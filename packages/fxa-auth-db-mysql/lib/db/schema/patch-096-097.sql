SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('96');

-- This migration adds an optional `refreshTokenId` column to the `devices` table,
-- allowing OAuth clients to participate in the sync device ecosystem.

-- First, in order for the migration to apply cleanly via migration tooling,
-- we need to drop `FOREIGN KEY` constraints on the `devices` table. There's
-- one instance of this in the old `deviceCapabilities` table which is no
-- longer used and should be safe to drop entirely.

DROP TABLE IF EXISTS deviceCapabilities;

-- And there are two foreign keys on the `deviceCommands` table, so we might
-- as well remove both while we're here.  The first links to the `deviceCommandIdentifiers`
-- table, from which we never delete and so which will not be affected by removal.
-- The second links to `devices` with `ON DELETE CASCADE`, and a previous migration
-- has added explicit deletions as a replacement.  So they're both safe to drop.

ALTER TABLE deviceCommands
  DROP FOREIGN KEY deviceCommands_ibfk_1,
  DROP FOREIGN KEY deviceCommands_ibfk_2,
ALGORITHM = INPLACE, LOCK = NONE;

-- With that, we can actually add the new columns.

ALTER TABLE devices
  ADD COLUMN refreshTokenId BINARY(32) DEFAULT NULL,
  ADD CONSTRAINT UQ_devices_refreshTokenId UNIQUE (uid, refreshTokenId),
ALGORITHM = INPLACE, LOCK = NONE;

-- And the stored procedures to use them.

CREATE PROCEDURE `createDevice_5` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inRefreshTokenId` BINARY(32),
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
    refreshTokenId,
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
    inRefreshTokenId,
    inNameUtf8,
    inType,
    inCreatedAt,
    inCallbackURL,
    inCallbackPublicKey,
    inCallbackAuthKey
  );
END;


CREATE PROCEDURE `updateDevice_6` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inRefreshTokenId` BINARY(32),
  IN `inNameUtf8` VARCHAR(255),
  IN `inType` VARCHAR(16),
  IN `inCallbackURL` VARCHAR(255),
  IN `inCallbackPublicKey` CHAR(88),
  IN `inCallbackAuthKey` CHAR(24),
  IN `inCallbackIsExpired` BOOLEAN
)
BEGIN
  UPDATE devices
  SET
    sessionTokenId = COALESCE(inSessionTokenId, sessionTokenId),
    refreshTokenId = COALESCE(inRefreshTokenId, refreshTokenId),
    nameUtf8 = COALESCE(inNameUtf8, nameUtf8),
    type = COALESCE(inType, type),
    callbackURL = COALESCE(inCallbackURL, callbackURL),
    callbackPublicKey = COALESCE(inCallbackPublicKey, callbackPublicKey),
    callbackAuthKey = COALESCE(inCallbackAuthKey, callbackAuthKey),
    callbackIsExpired = COALESCE(inCallbackIsExpired, callbackIsExpired)
  WHERE uid = inUid AND id = inId;
END;


-- Return the sessionTokenId and refreshTokenId from deleteDevice
-- so the auth server can remove them from other data stores.
CREATE PROCEDURE `deleteDevice_4` (
  IN `uidArg` BINARY(16),
  IN `idArg` BINARY(16)
)
BEGIN
  SELECT devices.sessionTokenId, devices.refreshTokenId FROM devices
  WHERE devices.uid = uidArg AND devices.id = idArg;

  DELETE devices, deviceCommands, sessionTokens, unverifiedTokens
  FROM devices
  LEFT JOIN deviceCommands
    ON (deviceCommands.uid = devices.uid AND deviceCommands.deviceId = devices.id)
  LEFT JOIN sessionTokens
    ON devices.sessionTokenId = sessionTokens.tokenId
  LEFT JOIN unverifiedTokens
    ON sessionTokens.tokenId = unverifiedTokens.tokenId
  WHERE devices.uid = uidArg
    AND devices.id = idArg;
END;


CREATE PROCEDURE `accountDevices_16` (
  IN `uidArg` BINARY(16)
)
BEGIN
  SELECT
    d.uid,
    d.id,
    s.tokenId AS sessionTokenId, -- Ensure we only return valid sessionToken ids
    d.refreshTokenId,
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
    ci.commandName,
    dc.commandData
  FROM devices AS d
  -- Left join, because it might not have a sessionToken.
  LEFT JOIN sessionTokens AS s
    ON d.sessionTokenId = s.tokenId
  LEFT JOIN (
    deviceCommands AS dc FORCE INDEX (PRIMARY)
    INNER JOIN deviceCommandIdentifiers AS ci FORCE INDEX (PRIMARY)
      ON ci.commandId = dc.commandId
  ) ON (dc.uid = d.uid AND dc.deviceId = d.id)
  WHERE d.uid = uidArg
  -- We don't want to return 'zombie' device records where the sessionToken
  -- no longer exists in the sessionTokens table.
  AND (s.tokenId IS NOT NULL OR d.refreshTokenId IS NOT NULL)
  -- For easy flattening, ensure rows are ordered by device id.
  ORDER BY 1, 2;
END;


CREATE PROCEDURE `device_3` (
  IN `uidArg` BINARY(16),
  IN `idArg` BINARY(16)
)
BEGIN
  SELECT
    d.uid,
    d.id,
    s.tokenId AS sessionTokenId, -- Ensure we only return valid sessionToken ids
    d.refreshTokenId,
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
    ci.commandName,
    dc.commandData
  FROM devices AS d
  -- Left join, because it might not have a sessionToken.
  LEFT JOIN sessionTokens AS s
    ON d.sessionTokenId = s.tokenId
  LEFT JOIN (
    deviceCommands AS dc FORCE INDEX (PRIMARY)
    INNER JOIN deviceCommandIdentifiers AS ci FORCE INDEX (PRIMARY)
      ON ci.commandId = dc.commandId
  ) ON (dc.uid = d.uid AND dc.deviceId = d.id)
  WHERE d.uid = uidArg
  AND d.id = idArg
  -- We don't want to return 'zombie' device records where the sessionToken
  -- no longer exists in the sessionTokens table.
  AND (s.tokenId IS NOT NULL OR d.refreshTokenId IS NOT NULL);
END;

UPDATE dbMetadata SET value = '97' WHERE name = 'schema-patch-level';
