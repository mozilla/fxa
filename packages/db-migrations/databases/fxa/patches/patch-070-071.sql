SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CREATE TABLE IF NOT EXISTS totp (
  uid BINARY(16) NOT NULL,
  sharedSecret VARCHAR(80) NOT NULL,
  epoch BIGINT NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY (`uid`)
) ENGINE=InnoDB;

CREATE PROCEDURE `createTotpToken_1` (
  IN `uidArg` BINARY(16),
  IN `sharedSecretArg` VARCHAR(80),
  IN `epochArg` BIGINT UNSIGNED,
  IN `createdAtArg` BIGINT UNSIGNED
)
BEGIN

  INSERT INTO totp(
    uid,
    sharedSecret,
    epoch,
    createdAt
  )
  VALUES(
    uidArg,
    sharedSecretArg,
    epochArg,
    createdAtArg
  );

END;

CREATE PROCEDURE `totpToken_1` (
  IN `uidArg` BINARY(16)
)
BEGIN

  SELECT sharedSecret, epoch FROM totp WHERE uid = uidArg;

END;

CREATE PROCEDURE `deleteTotpToken_1` (
  IN `uidArg` BINARY(16)
)
BEGIN

  DELETE FROM totp WHERE uid = uidArg;

END;

CREATE PROCEDURE `deleteAccount_14` (
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
  DELETE FROM devices WHERE uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  DELETE FROM unblockCodes WHERE uid = uidArg;
  DELETE FROM emails WHERE uid = uidArg;
  DELETE FROM signinCodes WHERE uid = uidArg;
  DELETE FROM totp WHERE uid = uidArg;

  COMMIT;
END;

UPDATE dbMetadata SET value = '71' WHERE name = 'schema-patch-level';

