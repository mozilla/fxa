SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('179');

-- Creates a new stored procedure to just get the count of devices for a given uid.
CREATE PROCEDURE `deviceCount_1` (
  IN `uidArg` BINARY(16)
)
BEGIN
  SELECT COUNT(*) AS deviceCount
  FROM devices AS d
  LEFT JOIN sessionTokens AS s ON d.sessionTokenId = s.tokenId
  WHERE d.uid = uidArg
  -- Similar to accountDevices_17, we need to filter out zombie devices.
  AND (s.tokenId IS NOT NULL OR d.refreshTokenId IS NOT NULL);
END;

UPDATE dbMetadata SET value = '180' WHERE name = 'schema-patch-level';
