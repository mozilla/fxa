CREATE PROCEDURE `sessionWithDevice_1` (
  IN `inTokenId` BINARY(32)
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
    t.lastAccessTime,
    a.emailVerified,
    a.email,
    a.emailCode,
    a.verifierSetAt,
    a.locale,
    a.createdAt AS accountCreatedAt,
    d.id AS deviceId,
    d.name AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey
  FROM
    sessionTokens t
    LEFT JOIN accounts a ON t.uid = a.uid
    LEFT JOIN devices d ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  WHERE
    t.tokenId = inTokenId;
END;

UPDATE dbMetadata SET value = '21' WHERE name = 'schema-patch-level';
