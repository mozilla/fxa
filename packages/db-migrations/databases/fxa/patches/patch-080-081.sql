SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CREATE TABLE IF NOT EXISTS recoveryKeys (
  uid BINARY(16) NOT NULL PRIMARY KEY,
  recoveryKeyId BINARY(64) NOT NULL,
  recoveryData TEXT
) ENGINE=InnoDB;

CREATE PROCEDURE `createRecoveryKey_1` (
  IN `uidArg` BINARY(16),
  IN `recoveryKeyIdArg` BINARY(64),
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

  INSERT INTO recoveryKeys (uid, recoveryKeyId, recoveryData) VALUES (uidArg, recoveryKeyIdArg, recoveryDataArg);

  COMMIT;
END;

CREATE PROCEDURE `getRecoveryKey_1` (
  IN `uidArg` BINARY(16),
  IN `recoveryKeyIdArg` BINARY(64)
)
BEGIN

  SELECT recoveryKeyId, recoveryData FROM recoveryKeys WHERE uid = uidArg AND recoveryKeyId = recoveryKeyIdArg;

END;

CREATE PROCEDURE `deleteRecoveryKey_1` (
  IN `uidArg` BINARY(16),
  IN `recoveryKeyIdArg` BINARY(64)
)
BEGIN

  DELETE FROM recoveryKeys WHERE uid = uidArg AND recoveryKeyId = recoveryKeyIdArg;

END;

UPDATE dbMetadata SET value = '81' WHERE name = 'schema-patch-level';

