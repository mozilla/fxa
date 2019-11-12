SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('105');

CREATE PROCEDURE `resetAccount_15` (
  IN `uidArg` BINARY(16),
  IN `verifyHashArg` BINARY(32),
  IN `authSaltArg` BINARY(32),
  IN `wrapWrapKbArg` BINARY(32),
  IN `verifierSetAtArg` BIGINT UNSIGNED,
  IN `verifierVersionArg` TINYINT UNSIGNED,
  IN `keysHaveChangedArg` BOOLEAN
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
    verifierVersion = verifierVersionArg,
    profileChangedAt = verifierSetAtArg,
    -- The `keysChangedAt` column was added in a migration, so its default value
    -- is NULL meaning "we don't know".  Now that we do know whether or not the keys
    -- are being changed, ensure it gets set to some concrete non-NULL value.
    keysChangedAt = IF(keysHaveChangedArg, verifierSetAtArg,  COALESCE(keysChangedAt, verifierSetAt, createdAt)),
    verifierSetAt = verifierSetAtArg
  WHERE uid = uidArg;

  COMMIT;
END;

UPDATE dbMetadata SET value = '106' WHERE name = 'schema-patch-level';
