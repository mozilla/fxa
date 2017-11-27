SET NAMES utf8mb4 COLLATE utf8mb4_bin;

ALTER TABLE `unverifiedTokens`
ADD COLUMN `tokenVerificationCodeHash` BINARY(32) DEFAULT NULL,
ADD COLUMN `tokenVerificationCodeExpiresAt` BIGINT UNSIGNED DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

CREATE UNIQUE INDEX `unverifiedTokens_tokenVerificationCodeHash_uid`
ON `unverifiedTokens` (`tokenVerificationCodeHash`, `uid`)
ALGORITHM = INPLACE LOCK=NONE;

CREATE PROCEDURE `verifyTokenCode_1` (
  IN `tokenVerificationCodeHashArg` BINARY(32),
  IN `uidArg` BINARY(16)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SET @tokenVerificationId = NULL;
  SELECT tokenVerificationId INTO @tokenVerificationId FROM unverifiedTokens
    WHERE uid = uidArg
    AND tokenVerificationCodeHash = tokenVerificationCodeHashArg
    AND tokenVerificationCodeExpiresAt >= (UNIX_TIMESTAMP(NOW(3)) * 1000);

  IF @tokenVerificationId IS NULL THEN
    SET @expiredCount = 0;
    SELECT COUNT(*) INTO @expiredCount FROM unverifiedTokens
      WHERE uid = uidArg
      AND tokenVerificationCodeHash = tokenVerificationCodeHashArg
      AND tokenVerificationCodeExpiresAt < (UNIX_TIMESTAMP(NOW(3)) * 1000);

    IF @expiredCount > 0 THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 2101, MESSAGE_TEXT = 'Expired token verification code.';
    END IF;
  END IF;

  START TRANSACTION;
    UPDATE securityEvents
    SET verified = true
    WHERE tokenVerificationId = @tokenVerificationId
    AND uid = uidArg;

    DELETE FROM unverifiedTokens
    WHERE tokenVerificationId = @tokenVerificationId
    AND uid = uidArg;

    SET @updateCount = (SELECT ROW_COUNT());
  COMMIT;

  SELECT @updateCount;
END;

CREATE PROCEDURE `createSessionToken_8` (
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

CREATE PROCEDURE `sessionTokenWithVerificationStatus_7` (
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

UPDATE dbMetadata SET value = '68' WHERE name = 'schema-patch-level';

