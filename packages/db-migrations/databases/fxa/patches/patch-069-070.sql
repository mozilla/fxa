SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- Return the sessionToken id from deleteDevice
-- so the auth server can remove it from Redis
CREATE PROCEDURE `deleteDevice_3` (
  IN `uidArg` BINARY(16),
  IN `idArg` BINARY(16)
)
BEGIN
  SELECT devices.sessionTokenId FROM devices
  WHERE devices.uid = uidArg AND devices.id = idArg;

  DELETE devices, sessionTokens, unverifiedTokens
  FROM devices
  LEFT JOIN sessionTokens
    ON devices.sessionTokenId = sessionTokens.tokenId
  LEFT JOIN unverifiedTokens
    ON sessionTokens.tokenId = unverifiedTokens.tokenId
  WHERE devices.uid = uidArg
    AND devices.id = idArg;
END;

UPDATE dbMetadata SET value = '70' WHERE name = 'schema-patch-level';

