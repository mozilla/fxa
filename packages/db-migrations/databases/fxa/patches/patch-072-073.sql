SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- Add columns `verified` and `enabled` to help manage TOTP token state
ALTER TABLE `totp`
ADD COLUMN `verified` BOOLEAN DEFAULT FALSE,
ADD COLUMN `enabled` BOOLEAN DEFAULT TRUE,
ALGORITHM = INPLACE, LOCK = NONE;

-- Add verification details to session token table
ALTER TABLE `sessionTokens`
ADD COLUMN `verificationMethod` INT DEFAULT NULL,
ADD COLUMN `verifiedAt` BIGINT DEFAULT NULL,
ADD COLUMN `mustVerify` BOOLEAN DEFAULT TRUE,
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `totpToken_2` (
  IN `uidArg` BINARY(16)
)
BEGIN

  SELECT sharedSecret, epoch, verified, enabled FROM `totp` WHERE uid = uidArg;

END;

CREATE PROCEDURE `updateTotpToken_1` (
  IN `uidArg` BINARY(16),
  IN `verifiedArg` BOOLEAN,
  IN `enabledArg` BOOLEAN
)
BEGIN

  UPDATE `totp` SET verified = verifiedArg, enabled = enabledArg WHERE uid = uidArg;

END;

CREATE PROCEDURE `verifyTokensWithMethod_1` (
  IN `tokenIdArg` BINARY(32),
  IN `verificationMethodArg` INT,
  IN `verifiedAtArg` BIGINT(1)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
    -- Update session verification methods
    UPDATE `sessionTokens` SET verificationMethod = verificationMethodArg, verifiedAt = verifiedAtArg
    WHERE tokenId = tokenIdArg;

    -- Get the tokenVerificationId and uid for session
    SET @tokenVerificationId = NULL;
    SET @uid = NULL;
    SELECT tokenVerificationId, uid INTO @tokenVerificationId, @uid FROM `unverifiedTokens`
    WHERE tokenId = tokenIdArg;

    -- Verify tokens with tokenVerificationId
    CALL verifyToken_3(@tokenVerificationId, @uid);

    SET @updateCount = (SELECT ROW_COUNT());
  COMMIT;

  SELECT @updateCount;
END;

CREATE PROCEDURE `sessionWithDevice_12` (
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

CREATE PROCEDURE `createSessionToken_9` (
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
  IN `mustVerify` BOOLEAN,
  IN `tokenVerificationCodeHash` BINARY(32),
  IN `tokenVerificationCodeExpiresAt` BIGINT UNSIGNED
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
    lastAccessTime,
    mustVerify
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
    createdAt,
    mustVerify
  );

  IF tokenVerificationId IS NOT NULL THEN
    INSERT INTO unverifiedTokens(
      tokenId,
      tokenVerificationId,
      uid,
      mustVerify,
      tokenVerificationCodeHash,
      tokenVerificationCodeExpiresAt
    )
    VALUES(
      tokenId,
      tokenVerificationId,
      uid,
      mustVerify,
      tokenVerificationCodeHash,
      tokenVerificationCodeExpiresAt
    );
  END IF;

  COMMIT;
END;

CREATE PROCEDURE `updateSessionToken_3` (
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

    UPDATE sessionTokens
      SET mustVerify = TRUE
      WHERE tokenId = tokenIdArg;
  END IF;

  COMMIT;
END;

UPDATE dbMetadata SET value = '73' WHERE name = 'schema-patch-level';

