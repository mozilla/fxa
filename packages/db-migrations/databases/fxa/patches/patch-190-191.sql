SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('190');

CREATE PROCEDURE `createVerifiedSessionToken_1` (
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
  IN `mustVerify` BOOLEAN,
  IN `providerId` TINYINT,
  IN `verificationMethod` INT,
  IN `verifiedAt` BIGINT UNSIGNED
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
    providerId,
    verificationMethod,
    verifiedAt
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
    providerId,
    verificationMethod,
    verifiedAt
  );

  COMMIT;
END;

UPDATE dbMetadata SET value = '191' WHERE name = 'schema-patch-level';
