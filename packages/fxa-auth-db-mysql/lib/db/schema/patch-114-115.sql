--
-- This migration introduces a table to track sent emails related to
-- subscriptions.
--

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('114');

CREATE TABLE IF NOT EXISTS emailTypes (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  -- these are intended to be email template names
  emailType VARCHAR(255) NOT NULL,
  UNIQUE emailTypeIndex (emailType)
) ENGINE=InnoDB;

INSERT INTO emailTypes (emailType) VALUES
  ('downloadSubscription'),
  ('lowRecoveryCodes'),
  ('newDeviceLogin'),
  ('passwordChanged'),
  ('passwordChangeRequired'),
  ('passwordReset'),
  ('passwordResetAccountRecovery'),
  ('passwordResetRequired'),
  ('postAddAccountRecovery'),
  ('postAddTwoStepAuthentication'),
  ('postChangePrimary'),
  ('postConsumeRecoveryCode'),
  ('postNewRecoveryCodes'),
  ('postRemoveAccountRecovery'),
  ('postRemoveSecondary'),
  ('postRemoveTwoStepAuthentication'),
  ('postVerify'),
  ('postVerifySecondary'),
  ('recovery'),
  ('subscriptionAccountDeletion'),
  ('subscriptionCancellation'),
  ('subscriptionDowngrade'),
  ('subscriptionFirstInvoice'),
  ('subscriptionPaymentExpired'),
  ('subscriptionPaymentFailed'),
  ('subscriptionPaymentProviderCancelled'),
  ('subscriptionReactivation'),
  ('subscriptionsPaymentExpired'),
  ('subscriptionsPaymentProviderCancelled'),
  ('subscriptionSubsequentInvoice'),
  ('subscriptionUpgrade'),
  ('unblockCode'),
  ('verify'),
  ('verifyLogin'),
  ('verifyLoginCode'),
  ('verifyPrimary'),
  ('verifySecondary'),
  ('verifySecondaryCode'),
  ('verifyShortCode');

CREATE TABLE IF NOT EXISTS sentEmails (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  uid BINARY(16) NOT NULL,
  emailTypeId SMALLINT UNSIGNED NOT NULL,
  -- any extra information that's needed for querying, e.g. a subscription id
  params JSON,
  -- a timestamp of when the email was sent, in milliseconds elapsed since
  -- January 1, 1970 00:00:00 UTC
  sentAt BIGINT UNSIGNED NOT NULL,
  INDEX sentEmailsIndex(uid, emailTypeId),
  FOREIGN KEY (emailTypeId) REFERENCES emailTypes (id)
) ENGINE=InnoDB;

CREATE PROCEDURE `deleteAccount_19` (
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

  COMMIT;
END;

UPDATE dbMetadata SET value = '115' WHERE name = 'schema-patch-level';
