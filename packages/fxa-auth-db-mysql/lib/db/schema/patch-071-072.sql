--
-- This migration adds an explicit `authAt` timestamp to the sessionTokens
-- table, making it possible to re-authenticate within an existing session
-- rather than generating a new one each time you need keys or a fresh auth
-- timestamp.
--

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

ALTER TABLE `sessionTokens`
ADD COLUMN `authAt` BIGINT UNSIGNED DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

-- The `authAt` column can be set by calling `updateSessionToken`.

CREATE PROCEDURE `updateSessionToken_2` (
    IN tokenIdArg BINARY(32),
    IN uaBrowserArg VARCHAR(255),
    IN uaBrowserVersionArg VARCHAR(255),
    IN uaOSArg VARCHAR(255),
    IN uaOSVersionArg VARCHAR(255),
    IN uaDeviceTypeArg VARCHAR(255),
    IN uaFormFactorArg VARCHAR(255),
    IN lastAccessTimeArg BIGINT UNSIGNED,
    IN authAtArg BIGINT UNSIGNED,
    IN mustVerifyArg BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  UPDATE sessionTokens
    SET uaBrowser = COALESCE(uaBrowserArg, uaBrowser),
      uaBrowserVersion = COALESCE(uaBrowserVersionArg, uaBrowserVersion),
      uaOS = COALESCE(uaOSArg, uaOS),
      uaOSVersion = COALESCE(uaOSVersionArg, uaOSVersion),
      uaDeviceType = COALESCE(uaDeviceTypeArg, uaDeviceType),
      uaFormFactor = COALESCE(uaFormFactorArg, uaFormFactor),
      lastAccessTime = COALESCE(lastAccessTimeArg, lastAccessTime),
      authAt = COALESCE(authAtArg, authAt, createdAt)
    WHERE tokenId = tokenIdArg;

  -- Allow updating mustVerify from FALSE to TRUE,
  -- but not the other way around.
  IF mustVerifyArg THEN
    UPDATE unverifiedTokens
      SET mustVerify = TRUE
      WHERE tokenId = tokenIdArg;
  END IF;

  COMMIT;
END;


-- Various other session-token procedures need to read the new field.

CREATE PROCEDURE `sessionToken_8` (
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
    COALESCE(t.authAt, t.createdAt) AS authAt,
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

CREATE PROCEDURE `sessionTokenWithVerificationStatus_8` (
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
    COALESCE(t.authAt, t.createdAt) AS authAt,
    e.isVerified AS emailVerified,
    e.email,
    e.emailCode,
    a.verifierSetAt,
    a.locale,
    a.createdAt AS accountCreatedAt,
    ut.tokenVerificationId,
    ut.mustVerify,
    ut.tokenVerificationCodeHash,
    ut.tokenVerificationCodeExpiresAt
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

CREATE PROCEDURE `sessionWithDevice_11` (
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


CREATE PROCEDURE `sessions_8` (
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
    d.callbackIsExpired AS deviceCallbackIsExpired
  FROM sessionTokens AS t
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  WHERE t.uid = uidArg;
END;


UPDATE dbMetadata SET value = '72' WHERE name = 'schema-patch-level';

