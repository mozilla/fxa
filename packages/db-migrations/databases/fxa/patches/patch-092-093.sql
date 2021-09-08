-- This migration removes the use of `ROW_COUNT()` on the last
-- remaining procedures.
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('92');

-- Updated to not use `ROW_COUNT()`. The previous procedure used row count to ensure that
-- the uid actually owned the email specified.
CREATE PROCEDURE `setPrimaryEmail_4` (
  IN `inUid` BINARY(16),
  IN `inNormalizedEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
    SELECT normalizedEmail INTO @foundEmail FROM emails WHERE uid = inUid AND normalizedEmail = inNormalizedEmail AND isVerified = false;
    IF @foundEmail IS NOT NULL THEN
     SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Can not change email. Email is not verified.';
    END IF;

    SELECT normalizedEmail INTO @foundEmail FROM emails WHERE uid = inUid AND normalizedEmail = inNormalizedEmail AND isVerified;
    IF @foundEmail IS NULL THEN
     SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1062, MESSAGE_TEXT = 'Can not change email. Could not find email.';
    END IF;

    UPDATE emails SET isPrimary = false WHERE uid = inUid AND isPrimary = true;
    UPDATE emails SET isPrimary = true WHERE uid = inUid AND isPrimary = false AND normalizedEmail = inNormalizedEmail;
  COMMIT;
END;

-- Updated to not use `ROW_COUNT()`. The previous procedure used row count to check to see
-- if the given code was actually found. The new procedure moves the responsibility to `db.consumeRecoveryCode`
-- where all recovery codes are retrieved and filtered to only the matching code.
CREATE PROCEDURE `consumeRecoveryCode_3` (
  IN `uidArg` BINARY(16),
  IN `codeHashArg` BINARY(32)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DELETE FROM `recoveryCodes` WHERE `uid` = `uidArg` AND `codeHash` = `codeHashArg`;

  SELECT COUNT(*) AS count FROM `recoveryCodes` WHERE `uid` = `uidArg`;

  COMMIT;
END;

UPDATE dbMetadata SET value = '93' WHERE name = 'schema-patch-level';
