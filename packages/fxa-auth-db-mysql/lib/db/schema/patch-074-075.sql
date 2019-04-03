SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CREATE TABLE IF NOT EXISTS recoveryCodes (
  uid BINARY(16) NOT NULL,
  codeHash BINARY(64) NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY (`uid`, `codeHash`)
) ENGINE=InnoDB;

CREATE PROCEDURE `deleteRecoveryCodes_1` (
  IN `uidArg` BINARY(16)
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
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Can not generate recovery codes for unknown user.';
  END IF;

  -- Delete all current recovery codes
  DELETE FROM `recoveryCodes` WHERE `uid` = `uidArg`;

  COMMIT;
END;

CREATE PROCEDURE `createRecoveryCode_1` (
  IN `uidArg` BINARY(16),
  IN `codeHashArg` BINARY(64)
)
BEGIN

  INSERT INTO recoveryCodes (uid, codeHash, createdAt) VALUES (uidArg, codeHashArg, NOW());

END;

CREATE PROCEDURE `consumeRecoveryCode_1` (
  IN `uidArg` BINARY(16),
  IN `codeHashArg` BINARY(64)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SET @deletedCount = 0;

  DELETE FROM `recoveryCodes` WHERE `uid` = `uidArg` AND `codeHash` = `codeHashArg`;

  SELECT ROW_COUNT() INTO @deletedCount;
  IF @deletedCount = 0 THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Unknown recovery code.';
  END IF;

  SELECT COUNT(*) AS count FROM `recoveryCodes` WHERE `uid` = `uidArg`;

  COMMIT;
END;

UPDATE dbMetadata SET value = '75' WHERE name = 'schema-patch-level';