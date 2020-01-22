-- This migration updates recoveryKey table to store createdAt, verifiedAt and enabled. This
-- will allow us to let the user confirm the key before actually enabling the feature.
-- Users that have setup account recovery before this migration are considered to have the feature
-- enabled.
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('106');

-- Add columns `createdAt`, `verifiedAt` and `enabled` to help manage account recovery
-- keys state
ALTER TABLE `recoveryKeys`
ADD COLUMN `createdAt` BIGINT UNSIGNED NOT NULL,
ADD COLUMN `verifiedAt` BIGINT UNSIGNED,
ADD COLUMN `enabled` BOOLEAN DEFAULT TRUE,
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `createRecoveryKey_4` (
  IN `uidArg` BINARY(16),
  IN `recoveryKeyIdHashArg` BINARY(32),
  IN `recoveryDataArg` TEXT,
  IN `createdAtArg` BIGINT UNSIGNED,
  IN `enabledArg` BOOLEAN
)
BEGIN

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SET @accountCount = 0;

  -- Signal error if no user found
  SELECT COUNT(*) INTO @accountCount FROM `accounts` WHERE `uid` = `uidArg`;
  IF @accountCount = 0 THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Can not create recovery key for unknown user.';
  END IF;

  INSERT INTO recoveryKeys (
    uid,
    recoveryKeyIdHash,
    recoveryData,
    createdAt,
    enabled
  )
  VALUES (
    uidArg,
    recoveryKeyIdHashArg,
    recoveryDataArg,
    createdAtArg,
    enabledArg
  );

  UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = uidArg;

  COMMIT;
END;

CREATE PROCEDURE `getRecoveryKey_4` (
  IN `uidArg` BINARY(16)
)
BEGIN

  SELECT recoveryKeyIdHash, recoveryData, createdAt, verifiedAt, enabled FROM recoveryKeys WHERE uid = uidArg;

END;

CREATE PROCEDURE `updateRecoveryKey_1` (
  IN `uidArg` BINARY(16),
  IN `recoveryKeyIdHashArg` BINARY(32),
  IN `verifiedAtArg` BIGINT UNSIGNED,
  IN `enabledArg` BOOLEAN
)
BEGIN

  UPDATE recoveryKeys
  SET
    verifiedAt = verifiedAtArg,
    enabled = enabledArg
  WHERE uid = uidArg
  AND recoveryKeyIdHash = recoveryKeyIdHashArg;

  UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = uidArg;

END;

UPDATE dbMetadata SET value = '107' WHERE name = 'schema-patch-level';
