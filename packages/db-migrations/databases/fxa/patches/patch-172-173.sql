SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('172');

CREATE PROCEDURE `replaceTotpToken_1` (
  IN `uidArg` BINARY(16),
  IN `sharedSecretArg` VARCHAR(80),
  IN `verifiedArg` BOOLEAN,
  IN `enabledArg` BOOLEAN,
  IN `epochArg` BIGINT UNSIGNED,
  IN `createdAtArg` BIGINT UNSIGNED
)
BEGIN
  REPLACE INTO `totp` (uid, sharedSecret, verified, enabled, epoch, createdAt)
    VALUES (uidArg, sharedSecretArg, verifiedArg, enabledArg, epochArg, createdAtArg);

  UPDATE accounts
  SET profileChangedAt = createdAtArg
  WHERE uid = uidArg;
END;

UPDATE dbMetadata SET value = '173' WHERE name = 'schema-patch-level';
