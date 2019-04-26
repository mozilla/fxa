SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('98');

CREATE PROCEDURE `totpToken_3` (
  IN `uidArg` BINARY(16)
)
BEGIN

  SELECT sharedSecret, epoch, verified, enabled, createdAt FROM `totp` WHERE uid = uidArg;

END;

UPDATE dbMetadata SET value = '99' WHERE name = 'schema-patch-level';
