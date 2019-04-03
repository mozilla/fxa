
CREATE TABLE devices (
  uid BINARY(16) NOT NULL,
  id BINARY(16) NOT NULL,
  sessionTokenId BINARY(32),
  name VARCHAR(255),
  type VARCHAR(16),
  createdAt BIGINT UNSIGNED,
  callbackURL VARCHAR(255),
  PRIMARY KEY (uid, id)
) ENGINE=InnoDB;


CREATE PROCEDURE `upsertDevice_1` (
    IN `inUid` BINARY(16),
    IN `inId` BINARY(16),
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
  VALUES (
    inUid,
    inId,
    inSessionTokenId,
    inName,
    inType,
    inCreatedAt,
    inCallbackURL
  )
  ON DUPLICATE KEY UPDATE
    sessionTokenId = COALESCE(inSessionTokenId, sessionTokenId),
    name = COALESCE(inName, name),
    type = COALESCE(inType, type),
    callbackURL = COALESCE(inCallbackURL, callbackURL);
END;

CREATE PROCEDURE `deleteDevice_1` (
    IN `inUid` BINARY(16),
    IN `inId` BINARY(16)
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
