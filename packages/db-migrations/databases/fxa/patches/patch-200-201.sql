SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('200');

-- Adds accounts.disabledAt to the session token lookup so the auth
-- strategies can reject a disabled account's sessions without a second query.
CREATE PROCEDURE `sessionWithDevice_20` (
  IN `tokenIdArg` BINARY(32)
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
    t.uaFormFactor,
    t.lastAccessTime,
    t.verificationMethod,
    t.verifiedAt,
    COALESCE(t.authAt, t.createdAt) AS authAt,
    e.isVerified AS emailVerified,
    e.email,
    e.emailCode,
    a.verifierSetAt,
    a.locale,
    COALESCE(a.profileChangedAt, a.verifierSetAt, a.createdAt) AS profileChangedAt,
    COALESCE(a.keysChangedAt, a.verifierSetAt, a.createdAt) AS keysChangedAt,
    a.createdAt AS accountCreatedAt,
    a.metricsOptOutAt AS metricsOptOutAt,
    a.disabledAt AS disabledAt,
    d.id AS deviceId,
    d.nameUtf8 AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey,
    d.callbackIsExpired AS deviceCallbackIsExpired,
    ci.commandName AS deviceCommandName,
    dc.commandData AS deviceCommandData,
    ut.tokenVerificationId,
    COALESCE(t.mustVerify, ut.mustVerify) AS mustVerify
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN emails AS e
    ON t.uid = e.uid
    AND e.isPrimary = true
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  LEFT JOIN (
    deviceCommands AS dc FORCE INDEX (PRIMARY)
    INNER JOIN deviceCommandIdentifiers AS ci FORCE INDEX (PRIMARY)
      ON ci.commandId = dc.commandId
  ) ON (dc.uid = d.uid AND dc.deviceId = d.id)
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

-- Deletes every session, token and device for an account while leaving the
-- account row intact. Same table order as resetAccount_20 to avoid deadlocks.
CREATE PROCEDURE `revokeAccountTokens_1` (
  IN `uidArg` BINARY(16)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DELETE FROM sessionTokens WHERE uid = uidArg;
  DELETE FROM keyFetchTokens WHERE uid = uidArg;
  DELETE FROM accountResetTokens WHERE uid = uidArg;
  DELETE FROM passwordChangeTokens WHERE uid = uidArg;
  DELETE FROM passwordForgotTokens WHERE uid = uidArg;
  DELETE devices, deviceCommands FROM devices LEFT JOIN deviceCommands
    ON (deviceCommands.uid = devices.uid AND deviceCommands.deviceId = devices.id)
    WHERE devices.uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  DELETE FROM unblockCodes WHERE uid = uidArg;

  COMMIT;
END;

UPDATE dbMetadata SET value = '201' WHERE name = 'schema-patch-level';
