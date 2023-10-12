SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('142');

-- Adds the providerId which maps to the third party auth provider used to generate session
ALTER TABLE `sessionTokens`
ADD COLUMN `providerId` TINYINT DEFAULT NULL,
ALGORITHM = INSTANT;

CREATE PROCEDURE `createSessionToken_10` (
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
  IN `providerId` TINYINT
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
    mustVerify,
    providerId
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
    mustVerify,
    providerId
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

UPDATE dbMetadata SET value = '143' WHERE name = 'schema-patch-level';
