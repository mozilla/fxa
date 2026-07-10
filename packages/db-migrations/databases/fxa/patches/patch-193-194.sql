SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('193');

-- Record why an account was deleted. Nullable for existing rows; new deletions
-- are stamped via deleteAccount_24.
ALTER TABLE deletedAccounts
ADD COLUMN deletionReason VARCHAR(64) DEFAULT NULL AFTER deletedAt, ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `deleteAccount_24` (
  IN `uidArg` BINARY(16),
  IN `deletionReasonArg` VARCHAR(64)
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

  INSERT IGNORE INTO deletedAccounts (uid, deletedAt, deletionReason) VALUES (uidArg, (UNIX_TIMESTAMP(NOW(3)) * 1000), deletionReasonArg);

  -- Backfill the reason if an earlier delete left the row without one.
  UPDATE deletedAccounts SET deletionReason = deletionReasonArg
    WHERE uid = uidArg AND deletionReason IS NULL AND deletionReasonArg IS NOT NULL;

  COMMIT;
END;

UPDATE dbMetadata SET value = '194' WHERE name = 'schema-patch-level';
