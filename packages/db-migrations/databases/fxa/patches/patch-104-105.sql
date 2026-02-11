SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('104');

CREATE PROCEDURE `resetAccount_14` (
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
    profileChangedAt = verifierSetAtArg,
    -- The auth-server doesn't yet tell us whether or not the user's keys have changed,
    -- so if they do a password reset, explicitly set the `keysChangedAt` timestamp to NULL
    -- for "we don't know". Without this logic we might get into a situation like:
    --
    --   1. Deploy a new auth-server version that starts writing to this column
    --   2. Some users reset their password, populating their `keysChangedAt` timestamp
    --   3. We have to roll back the new auth-server version for operational reasons
    --   4. A user from (2) resets their password again, leaving `keysChangedAt` at the
    --      non-NULL value given to it in (2).
    --   5. As a result, we incorrectly report that their key-rotation timestamp hasn't
    --      changed when in fact it has.
    --
    -- By resetting `keysChangedAt` to NULL if we don't know the proper value, we ensure it
    -- falls back to the current behaviour of defaulting to `verifierSetAt`.
    keysChangedAt = NULL
  WHERE uid = uidArg;

  COMMIT;
END;

UPDATE dbMetadata SET value = '105' WHERE name = 'schema-patch-level';
