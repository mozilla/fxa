-- Alter the accountDevices stored procedure to use INNER JOIN instead of
-- LEFT JOIN. There are zombie device records, we don't care about them.
CREATE PROCEDURE `accountDevices_5` (
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
    s.lastAccessTime
  FROM devices d INNER JOIN sessionTokens s
  ON d.sessionTokenId = s.tokenId
  WHERE d.uid = uidArg;
END;

UPDATE dbMetadata SET value = '31' WHERE name = 'schema-patch-level';
