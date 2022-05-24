CREATE PROCEDURE `accountDevices_17` (
  IN `uidArg` BINARY(16),
  IN `limitArg` INT
)
BEGIN
  SELECT 
    d.uid,
    d.id,
    s.tokenId AS sessionTokenId, -- Ensure we only return valid sessionToken ids
    d.refreshTokenId,
    d.nameUtf8 AS name,
    d.type,
    d.createdAt,
    d.callbackURL,
    d.callbackPublicKey,
    d.callbackAuthKey,
    d.callbackIsExpired,
    s.uaBrowser,
    s.uaBrowserVersion,
    s.uaOS,
    s.uaOSVersion,
    s.uaDeviceType,
    s.uaFormFactor,
    s.lastAccessTime,
    ci.commandName,
    dc.commandData
  FROM devices AS d
  -- Left join, because it might not have a sessionToken.
  LEFT JOIN sessionTokens AS s
    ON d.sessionTokenId = s.tokenId
  LEFT JOIN (
    deviceCommands AS dc FORCE INDEX (PRIMARY)
    INNER JOIN deviceCommandIdentifiers AS ci FORCE INDEX (PRIMARY)
      ON ci.commandId = dc.commandId
  ) ON (dc.uid = d.uid AND dc.deviceId = d.id)
  WHERE d.uid = uidArg
  -- We don't want to return 'zombie' device records where the sessionToken
  -- no longer exists in the sessionTokens table.
  AND (s.tokenId IS NOT NULL OR d.refreshTokenId IS NOT NULL)
  -- For easy flattening, ensure rows are ordered by device id.
  ORDER BY 1, 2
  LIMIT limitArg;
END;