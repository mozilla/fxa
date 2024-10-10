SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('156');

CREATE PROCEDURE `resetAccount_18` (
  IN `uidArg` BINARY(16),
  IN `verifyHashArg` BINARY(32),
  IN `verifyHashVersion2Arg` BINARY(32),
  IN `authSaltArg` BINARY(32),
  IN `clientSaltArg` VARCHAR(128),
  IN `wrapWrapKbArg` BINARY(32),
  IN `wrapWrapKbVersion2Arg` BINARY(32),
  IN `verifierSetAtArg` BIGINT UNSIGNED,
  IN `verifierVersionArg` TINYINT UNSIGNED,
  IN `keysHaveChangedArg` BOOLEAN,
  IN `isPasswordUpgrade` BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- When we upgrade accounts to key stretching v2, we do
  -- an 'automated reset' for the user. When we do this, we
  -- preserve the underlying private key, so there's actually
  -- no reason to drop associated data.
  IF isPasswordUpgrade = 0 THEN
    DELETE FROM sessionTokens WHERE uid = uidArg;
    DELETE FROM keyFetchTokens WHERE uid = uidArg;
    DELETE FROM accountResetTokens WHERE uid = uidArg;
    DELETE FROM passwordChangeTokens WHERE uid = uidArg;
    DELETE FROM passwordForgotTokens WHERE uid = uidArg;
    DELETE FROM recoveryKeys WHERE uid = uidArg;
    DELETE devices, deviceCommands FROM devices LEFT JOIN deviceCommands
        ON (deviceCommands.uid = devices.uid AND deviceCommands.deviceId = devices.id)
        WHERE devices.uid = uidArg;  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  END IF;

  UPDATE accounts
  SET
    verifyHash = verifyHashArg,
    verifyHashVersion2 = verifyHashVersion2Arg,
    wrapWrapKb = wrapWrapKbArg,
    wrapWrapKbVersion2 = wrapWrapKbVersion2Arg,
    authSalt = authSaltArg,
    clientSalt = clientSaltArg,
    verifierVersion = verifierVersionArg,
    profileChangedAt = verifierSetAtArg,
    -- The `keysChangedAt` column was added in a migration, so its default value
    -- is NULL meaning "we don't know".  Now that we do know whether or not the keys
    -- are being changed, ensure it gets set to some concrete non-NULL value.
    keysChangedAt = IF(keysHaveChangedArg, verifierSetAtArg,  COALESCE(keysChangedAt, verifierSetAt, createdAt)),
    verifierSetAt = verifierSetAtArg,
    lockedAt = NULL
  WHERE uid = uidArg;

  COMMIT;
END;

UPDATE dbMetadata SET value = '157' WHERE name = 'schema-patch-level';
