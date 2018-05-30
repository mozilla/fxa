--
-- This migration lets devices register "available commands",
-- a simple mapping from opaque command names to opaque blobs of
-- associated data.
--

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- We expect many devices to register support for a relatively
-- small set of common commands, so we map command URIs to integer
-- ids for more efficient storage.

CREATE TABLE IF NOT EXISTS deviceCommandIdentifiers (
  commandId INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  commandName VARCHAR(191) NOT NULL UNIQUE KEY
) ENGINE=InnoDB;

-- The mapping from devices to their set of available commands is
-- a simple one-to-many table with associated data blob.  For now
-- we expect calling code to update this table by deleting all
-- rows for a device and then re-adding them.  In the future we
-- may add support for deleting individual rows, if and when we
-- grow a client-facing API that needs it.

CREATE TABLE IF NOT EXISTS deviceCommands (
  uid BINARY(16) NOT NULL,
  deviceId BINARY(16) NOT NULL,
  commandId INT UNSIGNED NOT NULL,
  commandData VARCHAR(2048),
  PRIMARY KEY (uid, deviceId, commandId),
  FOREIGN KEY (commandId) REFERENCES deviceCommandIdentifiers(commandId) ON DELETE CASCADE,
  FOREIGN KEY (uid, deviceId) REFERENCES devices(uid, id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE PROCEDURE `upsertAvailableCommand_1` (
  IN `inUid` BINARY(16),
  IN `inDeviceId` BINARY(16),
  IN `inCommandURI` VARCHAR(255),
  IN `inCommandData` VARCHAR(2048)
)
BEGIN

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Find or create the corresponding integer ID for this command.
  SET @commandId = NULL;
  SELECT commandId INTO @commandId FROM deviceCommandIdentifiers WHERE commandName = inCommandURI;
  IF @commandId IS NULL THEN
    INSERT INTO deviceCommandIdentifiers (commandName) VALUES (inCommandURI);
    SET @commandId = LAST_INSERT_ID();
  END IF;

  -- Upsert the device's advertizement of that command.
  INSERT INTO deviceCommands(
    uid,
    deviceId,
    commandId,
    commandData
  )
  VALUES (
    inUid,
    inDeviceId,
    @commandId,
    inCommandData
  )
  ON DUPLICATE KEY UPDATE
    commandData = inCommandData
  ;

  COMMIT;
END;

CREATE PROCEDURE `purgeAvailableCommands_1` (
  IN `inUid` BINARY(16),
  IN `inDeviceId` BINARY(16)
)
BEGIN
  DELETE FROM deviceCommands
    WHERE uid = inUid
    AND deviceId = inDeviceId;
END;

-- When listing all devices, or retrieving a single device,
-- we select all rows from the deviceCommands table.
-- Calling code will thus receive multiple rows for each device,
-- one per available command.  Devices with no available commands
-- will contain NULL in those columns.  Like this:
--
--  +-----+---------+-------+-----+--------------+--------------+
--  | uid | device1 | name1 | ... | commandName1 | commandData1 |
--  | uid | device1 | name1 | ... | commandName2 | commandData2 |
--  | uid | device2 | name2 | ... | commandName1 | commandData3 |
--  | uid | device3 | name3 | ... | NULL         | NULL         |
--  +-----+---------+-------+-----+--------------+--------------+
--
-- It will need to flatten the rows into a list of devices with
-- an associated mapping of available commands.
--
-- Newer versions of MySQL have an aggregation function called
-- "JSON_OBJECTAGG" that would allow us to do that flattening
-- as part of the query, like this:
--
--    SELECT uid, id, ..., JSON_OBJECTAGG(commandName, commandData) AS availableCommands
--    FROM ...
--    GROUP BY 1, 2
--
-- But sadly, we're not on newer versions of MySQL in production.

CREATE PROCEDURE `accountDevices_14` (
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
    ci.commandName,
    dc.commandData
  FROM devices AS d
  INNER JOIN sessionTokens AS s
    ON d.sessionTokenId = s.tokenId
  LEFT JOIN (
    deviceCommands AS dc
    INNER JOIN deviceCommandIdentifiers AS ci
      ON ci.commandId = dc.commandId
  ) ON dc.deviceId = d.id
  WHERE d.uid = uidArg
  -- For easy flattening, ensure rows are ordered by device id.
  ORDER BY 1, 2;
END;

CREATE PROCEDURE `device_1` (
  IN `uidArg` BINARY(16),
  IN `idArg` BINARY(16)
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
    ci.commandName,
    dc.commandData
  FROM devices AS d
  INNER JOIN sessionTokens AS s
    ON d.sessionTokenId = s.tokenId
  LEFT JOIN (
    deviceCommands AS dc
    INNER JOIN deviceCommandIdentifiers AS ci
      ON ci.commandId = dc.commandId
  ) ON dc.deviceId = d.id
  WHERE d.uid = uidArg
  AND d.id = idArg;
END;

CREATE PROCEDURE `deviceFromTokenVerificationId_5` (
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
    ci.commandName,
    dc.commandData
  FROM unverifiedTokens AS u
  INNER JOIN devices AS d
    ON (u.tokenId = d.sessionTokenId AND u.uid = d.uid)
  LEFT JOIN (
    deviceCommands AS dc
    INNER JOIN deviceCommandIdentifiers AS ci
      ON ci.commandId = dc.commandId
  ) ON dc.deviceId = d.id
  WHERE u.uid = inUid AND u.tokenVerificationId = inTokenVerificationId;
END;

CREATE PROCEDURE `sessionWithDevice_14` (
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
    ci.commandName AS deviceCommandName,
    dc.commandData AS deviceCommandData,
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
  LEFT JOIN (
    deviceCommands AS dc
    INNER JOIN deviceCommandIdentifiers AS ci
      ON ci.commandId = dc.commandId
  ) ON dc.deviceId = d.id
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

CREATE PROCEDURE `sessions_10` (
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
    ci.commandName AS deviceCommandName,
    dc.commandData AS deviceCommandData
  FROM sessionTokens AS t
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  LEFT JOIN (
    deviceCommands AS dc
    INNER JOIN deviceCommandIdentifiers AS ci
      ON ci.commandId = dc.commandId
  ) ON dc.deviceId = d.id
  WHERE t.uid = uidArg
  ORDER BY 1;
END;

UPDATE dbMetadata SET value = '82' WHERE name = 'schema-patch-level';
