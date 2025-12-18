CREATE PROCEDURE `deviceFromRefreshTokenId_1` (
  IN `uidArg` BINARY(16),
  IN `refreshTokenIdArg` BINARY(32)
)
BEGIN
  SELECT
    d.uid,
    d.id,
    d.refreshTokenId,
    d.nameUtf8 AS name,
    d.type,
    d.createdAt,
    d.callbackURL,
    d.callbackPublicKey,
    d.callbackAuthKey,
    d.callbackIsExpired,
    ci.commandName,
    dc.commandData
  FROM devices AS d
  LEFT JOIN (
    deviceCommands AS dc FORCE INDEX (PRIMARY)
    INNER JOIN deviceCommandIdentifiers AS ci FORCE INDEX (PRIMARY)
      ON ci.commandId = dc.commandId
  ) ON (dc.uid = d.uid AND dc.deviceId = d.id)
  WHERE d.uid = uidArg
    AND d.refreshTokenId = refreshTokenIdArg;
END;
