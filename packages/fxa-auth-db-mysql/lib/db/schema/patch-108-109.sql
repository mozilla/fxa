-- This migration will help us to abstract the half baked recovery keys of fxa accounts. In this migration,
-- we're adding a new `upsertRecoveryKey` procedure that will handle the half baked recovery keys by using
-- the following criterias.

-- 1. If a user has no recovery key then create a new recovery key.
-- 2. If a user has unverified recovery key then delete that recovery key and create a new unverified
--    recovery key.
-- 3. If a user has verified recovery key then throw an exception

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('108');

CREATE PROCEDURE `upsertRecoveryKey_1` (
  IN `uidArg` BINARY(16),
  IN `recoveryKeyIdHashArg` BINARY(32),
  IN `recoveryDataArg` TEXT,
  IN `createdAtArg` BIGINT UNSIGNED,
  IN `enabledArg` BOOLEAN
)
BEGIN

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    RESIGNAL;
  END;

  -- Signal error if no user found
  SET @accountCount = 0;
  SELECT COUNT(*) INTO @accountCount FROM `accounts` WHERE `uid` = `uidArg`;
  IF @accountCount = 0 THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Can not create recovery key for unknown user.';
  END IF;

  -- Signal error if verified recovery key already exists
  SET @verifiedRecoveryKeyCount = 0;
  SELECT COUNT(*) INTO @verifiedRecoveryKeyCount FROM `recoveryKeys` WHERE `uid` = `uidArg` AND verifiedAt IS NOT NULL;
  IF @verifiedRecoveryKeyCount = 1 THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1062, MESSAGE_TEXT = 'Verified recovery key already exists for this user.';
  END IF;

  DELETE FROM recoveryKeys WHERE uid = uidArg AND verifiedAt IS NULL;

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

END;

UPDATE dbMetadata SET value = '109' WHERE name = 'schema-patch-level';
