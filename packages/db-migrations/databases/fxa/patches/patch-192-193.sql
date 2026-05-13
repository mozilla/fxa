SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('192');

-- Update deleteAccount stored procedure to delete passkeys before accounts.
-- The passkeys.uid FK on accounts(uid) lacks ON DELETE CASCADE, so deleting
-- from accounts before passkeys aborts the transaction with
-- ER_ROW_IS_REFERENCED_2 for any user that has registered a passkey.
CREATE PROCEDURE `deleteAccount_23` (
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
  DELETE FROM passkeys WHERE uid = uidArg;
  DELETE FROM accounts WHERE uid = uidArg;
  DELETE devices, deviceCommands FROM devices LEFT JOIN deviceCommands
    ON (deviceCommands.uid = devices.uid AND deviceCommands.deviceId = devices.id)
    WHERE devices.uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  DELETE FROM unblockCodes WHERE uid = uidArg;
  DELETE FROM emails WHERE uid = uidArg;
  DELETE FROM signinCodes WHERE uid = uidArg;
  DELETE FROM totp WHERE uid = uidArg;
  DELETE FROM recoveryKeys WHERE uid = uidArg;
  DELETE FROM recoveryCodes WHERE uid = uidArg;
  DELETE FROM securityEvents WHERE uid = uidArg;
  DELETE FROM sentEmails WHERE uid = uidArg;
  DELETE FROM linkedAccounts WHERE uid = uidArg;

  INSERT IGNORE INTO deletedAccounts (uid, deletedAt) VALUES (uidArg, (UNIX_TIMESTAMP(NOW(3)) * 1000));

  COMMIT;
END;

UPDATE dbMetadata SET value = '193' WHERE name = 'schema-patch-level';
