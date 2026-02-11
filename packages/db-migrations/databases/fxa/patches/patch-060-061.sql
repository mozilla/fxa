ALTER TABLE `sessionTokens`
ADD COLUMN `uaFormFactor` VARCHAR(255),
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `createSessionToken_7` (
  IN `tokenId` BINARY(32),
  IN `tokenData` BINARY(32),
  IN `uid` BINARY(16),
  IN `createdAt` BIGINT UNSIGNED,
  IN `uaBrowser` VARCHAR(255),
  IN `uaBrowserVersion` VARCHAR(255),
  IN `uaOS` VARCHAR(255),
  IN `uaOSVersion` VARCHAR(255),
  IN `uaDeviceType` VARCHAR(255),
  IN `uaFormFactor` VARCHAR(255),
  IN `tokenVerificationId` BINARY(16),
  IN `mustVerify` BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT INTO sessionTokens(
    tokenId,
    tokenData,
    uid,
    createdAt,
    uaBrowser,
    uaBrowserVersion,
    uaOS,
    uaOSVersion,
    uaDeviceType,
    uaFormFactor,
    lastAccessTime
  )
  VALUES(
    tokenId,
    tokenData,
    uid,
    createdAt,
    uaBrowser,
    uaBrowserVersion,
    uaOS,
    uaOSVersion,
    uaDeviceType,
    uaFormFactor,
    createdAt
  );

  IF tokenVerificationId IS NOT NULL THEN
    INSERT INTO unverifiedTokens(
      tokenId,
      tokenVerificationId,
      uid,
      mustVerify
    )
    VALUES(
      tokenId,
      tokenVerificationId,
      uid,
      mustVerify
    );
  END IF;

  COMMIT;
END;

CREATE PROCEDURE `sessionToken_7` (
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
    a.createdAt AS accountCreatedAt
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN emails AS e
    ON t.uid = e.uid
    AND e.isPrimary = true
  WHERE t.tokenId = tokenIdArg;
END;

CREATE PROCEDURE `sessionTokenWithVerificationStatus_6` (
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
    ut.tokenVerificationId,
    ut.mustVerify
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN emails AS e
    ON t.uid = e.uid
    AND e.isPrimary = true
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

CREATE PROCEDURE `sessionWithDevice_8` (
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
    AND e.isPrimary = true
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

CREATE PROCEDURE `sessions_5` (
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
    d.name AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey
  FROM sessionTokens AS t
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  WHERE t.uid = uidArg;
END;

CREATE PROCEDURE `accountDevices_10` (
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

UPDATE dbMetadata SET value = '61' WHERE name = 'schema-patch-level';

