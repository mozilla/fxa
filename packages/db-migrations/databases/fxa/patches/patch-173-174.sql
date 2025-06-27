SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('173');

CREATE TABLE IF NOT EXISTS `deletedAccounts` (
    `uid` BINARY(16) PRIMARY KEY,
    `deletedAt` BIGINT UNSIGNED NOT NULL
);

CREATE PROCEDURE `deleteAccount_21` (
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

UPDATE dbMetadata SET value = '174' WHERE name = 'schema-patch-level';
