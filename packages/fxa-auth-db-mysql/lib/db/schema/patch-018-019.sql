
CREATE TABLE devices (
  uid BINARY(16) NOT NULL,
  id INT UNSIGNED NOT NULL,
  sessionTokenId BINARY(32),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(16) NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  callbackURL VARCHAR(255),
  INDEX devices_uid (uid),
  PRIMARY KEY (uid, id)
) ENGINE=InnoDB;


CREATE PROCEDURE `createDevice_1` (
    IN `inUid` BINARY(16),
    IN `inSessionTokenId` BINARY(32),
    IN `inName` VARCHAR(255),
    IN `inType` VARCHAR(16),
    IN `inCreatedAt` BIGINT UNSIGNED,
    IN `inCallbackURL` VARCHAR(255)
)
BEGIN
  INSERT INTO devices(
    uid,
    id,
    sessionTokenId,
    name,
    type,
    createdAt,
    callbackURL
  )
  SELECT
    inUid,
    COALESCE(MAX(id), 0) + 1,
    inSessionTokenId,
    inName,
    inType,
    inCreatedAt,
    inCallbackURL
  FROM
    devices
  WHERE
    uid = inUid;

  SELECT
    d.uid,
    d.id,
    d.sessionTokenId,
    d.name,
    d.type,
    d.createdAt,
    d.callbackURL,
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
    d.uid = inUid
  ORDER BY
    d.id
  DESC
  LIMIT 1;
END;

CREATE PROCEDURE `updateDevice_1` (
    IN `inUid` BINARY(16),
    IN `inId` INT UNSIGNED,
    IN `inSessionTokenId` BINARY(32),
    IN `inName` VARCHAR(255),
    IN `inType` VARCHAR(16),
    IN `inCallbackURL` VARCHAR(255)
)
BEGIN
  UPDATE
    devices
  SET
    sessionTokenId = COALESCE(inSessionTokenId, sessionTokenId),
    name = COALESCE(inName, name),
    type = COALESCE(inType, type),
    callbackURL = COALESCE(inCallbackURL, callbackURL)
  WHERE
    uid = inUid
  AND
    id = inId;

  SELECT
    d.uid,
    d.id,
    d.sessionTokenId,
    d.name,
    d.type,
    d.createdAt,
    d.callbackURL,
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
    d.uid = inUid
  AND
    d.id = inId;
END;

CREATE PROCEDURE `deleteDevice_1` (
    IN `inUid` BINARY(16),
    IN `inId` INT UNSIGNED
)
BEGIN
  DELETE
    devices, sessionTokens
  FROM
    devices LEFT JOIN sessionTokens
  ON
    devices.sessionTokenId = sessionTokens.tokenId
  WHERE
    devices.uid = inUid
  AND
    devices.id = inId;
END;

CREATE PROCEDURE `accountDevices_2` (
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

CREATE PROCEDURE `deleteAccount_6` (
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
    DELETE FROM devices WHERE uid = inUid;

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
UPDATE dbMetadata SET value = '19' WHERE name = 'schema-patch-level';
