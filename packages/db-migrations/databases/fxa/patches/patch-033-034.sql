-- Alter the accountDevices stored procedure to INNER JOIN with accounts
-- so that we can disable devices.lastAccessTime by email address in the
-- auth server.
CREATE PROCEDURE `accountDevices_6` (
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
    s.lastAccessTime,
    a.email
  FROM devices AS d
  INNER JOIN sessionTokens AS s
    ON d.sessionTokenId = s.tokenId
  INNER JOIN accounts AS a
    ON d.uid = a.uid
  WHERE d.uid = uidArg;
END;

UPDATE dbMetadata SET value = '34' WHERE name = 'schema-patch-level';
