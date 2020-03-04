-- This migration reverts changes from patch-097-098, removing references
-- to accountSubscriptions and effectively rolling back to deleteAccount_16
-- from patch-095-096

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('107');

-- DROP PROCEDURE `createAccountSubscription_1`;
-- DROP PROCEDURE `deleteAccountSubscription_1`;
-- DROP PROCEDURE `getAccountSubscription_1`;
-- DROP PROCEDURE `fetchAccountSubscriptions_1`;
-- DROP PROCEDURE `deleteAccount_17`;
DROP TABLE accountSubscriptions;

CREATE PROCEDURE `deleteAccount_18` (
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

  COMMIT;
END;

UPDATE dbMetadata SET value = '108' WHERE name = 'schema-patch-level';
