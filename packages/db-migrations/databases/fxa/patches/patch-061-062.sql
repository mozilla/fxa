--  Update devices table to utf8mb4
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

ALTER DATABASE fxa CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

ALTER TABLE devices ADD COLUMN nameUtf8 VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin AFTER name,
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `createDevice_3` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inName` VARCHAR(255),
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
    name,
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
    inName,
    inNameUtf8,
    inType,
    inCreatedAt,
    inCallbackURL,
    inCallbackPublicKey,
    inCallbackAuthKey
  );
END;

CREATE PROCEDURE `updateDevice_3` (
  IN `inUid` BINARY(16),
  IN `inId` BINARY(16),
  IN `inSessionTokenId` BINARY(32),
  IN `inName` VARCHAR(255),
  IN `inNameUtf8` VARCHAR(255),
  IN `inType` VARCHAR(16),
  IN `inCallbackURL` VARCHAR(255),
  IN `inCallbackPublicKey` CHAR(88),
  IN `inCallbackAuthKey` CHAR(24)
)
BEGIN
  UPDATE devices
  SET sessionTokenId = COALESCE(inSessionTokenId, sessionTokenId),
    name = COALESCE(inName, name),
    nameUtf8 = COALESCE(inNameUtf8, nameUtf8),
    type = COALESCE(inType, type),
    callbackURL = COALESCE(inCallbackURL, callbackURL),
    callbackPublicKey = COALESCE(inCallbackPublicKey, callbackPublicKey),
    callbackAuthKey = COALESCE(inCallbackAuthKey, callbackAuthKey)
  WHERE uid = inUid AND id = inId;
END;

UPDATE dbMetadata SET value = '62' WHERE name = 'schema-patch-level';
