CREATE PROCEDURE `createSessionToken_6` (
  IN `tokenId` BINARY(32),
  IN `tokenData` BINARY(32),
  IN `uid` BINARY(16),
  IN `createdAt` BIGINT UNSIGNED,
  IN `uaBrowser` VARCHAR(255),
  IN `uaBrowserVersion` VARCHAR(255),
  IN `uaOS` VARCHAR(255),
  IN `uaOSVersion` VARCHAR(255),
  IN `uaDeviceType` VARCHAR(255),
  IN `tokenVerificationId` BINARY(16),
  IN `mustVerify` BOOLEAN
)
BEGIN
  CALL createSessionToken_4(
    tokenId,
    tokenData,
    uid,
    createdAt,
    uaBrowser,
    uaBrowserVersion,
    uaOS,
    uaOSVersion,
    uaDeviceType,
    tokenVerificationId,
    mustVerify
  );
END;

CREATE PROCEDURE `sessionToken_6` (
  IN `tokenIdArg` BINARY(32)
)
BEGIN
  CALL sessionToken_4(tokenIdArg);
END;

CREATE PROCEDURE `sessionTokenWithVerificationStatus_5` (
  IN `tokenIdArg` BINARY(32)
)
BEGIN
  CALL sessionTokenWithVerificationStatus_3(tokenIdArg);
END;

CREATE PROCEDURE `sessionWithDevice_7` (
  IN `tokenIdArg` BINARY(32)
)
BEGIN
  CALL sessionWithDevice_5(tokenIdArg);
END;

CREATE PROCEDURE `sessions_4` (
  IN `uidArg` BINARY(16)
)
BEGIN
  CALL sessions_2(uidArg);
END;

CREATE PROCEDURE `accountDevices_9` (
  IN `uidArg` BINARY(16)
)
BEGIN
  CALL accountDevices_7(uidArg);
END;

ALTER TABLE `sessionTokens`
DROP COLUMN `uaFormFactor`,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '60' WHERE name = 'schema-patch-level';

