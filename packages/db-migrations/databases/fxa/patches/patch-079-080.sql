SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- createdAt value is never returned to the user and not used internally

ALTER TABLE recoveryCodes DROP COLUMN createdAt;

CREATE PROCEDURE `createRecoveryCode_3` (
  IN `uidArg` BINARY(16),
  IN `codeHashArg` BINARY(32),
  IN `saltArg` BINARY(32)
)
BEGIN

  INSERT INTO recoveryCodes (uid, codeHash, salt) VALUES (uidArg, codeHashArg, saltArg);

END;

UPDATE dbMetadata SET value = '80' WHERE name = 'schema-patch-level';
