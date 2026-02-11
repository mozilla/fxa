SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('184');

-- Create the 'passkeys' table for WebAuthn/FIDO2 passkey credentials.
-- Each passkey is uniquely identified by credentialId and associated with a user (uid).
-- The table stores the public key, signature counter, and metadata for each passkey.
CREATE TABLE passkeys (
    uid BINARY(16) NOT NULL,
    -- WebAuthn spec defines maximum credential ID length as 1023 bytes
    -- https://www.w3.org/TR/webauthn-3/#credential-id
    credentialId VARBINARY(1023) NOT NULL,
    publicKey BLOB NOT NULL,
    signCount INT UNSIGNED NOT NULL DEFAULT 0,
    transports JSON NOT NULL,
    aaguid BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    createdAt BIGINT UNSIGNED NOT NULL,
    lastUsedAt BIGINT UNSIGNED NULL,
    backupEligible TINYINT(1) NOT NULL DEFAULT 0,
    backupState TINYINT(1) NOT NULL DEFAULT 0,
    prfEnabled TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (uid, credentialId),
    UNIQUE KEY idx_credentialId (credentialId),
    FOREIGN KEY (uid) REFERENCES accounts(uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Update deleteAccount stored procedure to explicitly handle passkeys deletion
CREATE PROCEDURE `deleteAccount_22` (
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
  DELETE FROM passkeys WHERE uid = uidArg;

  INSERT IGNORE INTO deletedAccounts (uid, deletedAt) VALUES (uidArg, (UNIX_TIMESTAMP(NOW(3)) * 1000));

  COMMIT;
END;

UPDATE dbMetadata SET value = '185' WHERE name = 'schema-patch-level';
