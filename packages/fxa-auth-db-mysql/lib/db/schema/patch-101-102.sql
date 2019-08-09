SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('101');

CREATE PROCEDURE `resetAccount_13` (
  IN `uidArg` BINARY(16),
  IN `verifyHashArg` BINARY(32),
  IN `authSaltArg` BINARY(32),
  IN `wrapWrapKbArg` BINARY(32),
  IN `verifierSetAtArg` BIGINT UNSIGNED,
  IN `verifierVersionArg` TINYINT UNSIGNED
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
  DELETE FROM recoveryKeys WHERE uid = uidArg;
  DELETE devices, deviceCommands FROM devices LEFT JOIN deviceCommands
    ON (deviceCommands.uid = devices.uid AND deviceCommands.deviceId = devices.id)
    WHERE devices.uid = uidArg;  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  UPDATE accounts
  SET
    verifyHash = verifyHashArg,
    authSalt = authSaltArg,
    wrapWrapKb = wrapWrapKbArg,
    verifierSetAt = verifierSetAtArg,
    verifierVersion = verifierVersionArg,
    profileChangedAt = verifierSetAtArg
  WHERE uid = uidArg;

  COMMIT;
END;

UPDATE dbMetadata SET value = '102' WHERE name = 'schema-patch-level';
