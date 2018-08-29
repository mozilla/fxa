-- This migration updates recoveryKey table to store a hashed value of
-- the `recoveryKeyId` instead of the raw value. As part of this migration,
-- we will remove all existing recoveryKeys. This will help to ensure a consistent
-- migration.
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('85');

DELETE FROM recoveryKeys;

-- We can drop this since we will be using the `recoveryKeyIdHash`
-- column instead.
ALTER TABLE recoveryKeys DROP COLUMN recoveryKeyId,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE recoveryKeys ADD COLUMN recoveryKeyIdHash BINARY(32) NOT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

-- If we are in the process of a rollout and a user calls `createRecoveryKey_2`
-- then that request will fail. But that is ok since the previous create
-- procedure would have put the raw recoveryKeyId in database, which
-- would not work anyways.
CREATE PROCEDURE `createRecoveryKey_3` (
  IN `uidArg` BINARY(16),
  IN `recoveryKeyIdHashArg` BINARY(32),
  IN `recoveryDataArg` TEXT
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

  INSERT INTO recoveryKeys (uid, recoveryKeyIdHash, recoveryData) VALUES (uidArg, recoveryKeyIdHashArg, recoveryDataArg);

  COMMIT;
END;

CREATE PROCEDURE `getRecoveryKey_3` (
  IN `uidArg` BINARY(16)
)
BEGIN

  SELECT recoveryKeyIdHash, recoveryData FROM recoveryKeys WHERE uid = uidArg;

END;

UPDATE dbMetadata SET value = '86' WHERE name = 'schema-patch-level';
