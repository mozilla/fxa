CREATE PROCEDURE `deleteRecoveryCodes_2` (
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
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Can not generate backup authentication codes for unknown user.';
  END IF;

  -- Delete all current backup authentication codes
  DELETE FROM `recoveryCodes` WHERE `uid` = `uidArg`;

  COMMIT;
END;

CREATE PROCEDURE `createRecoveryKey_5` (
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
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Can not create account recovery key for unknown user.';
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


UPDATE dbMetadata SET value = '136' WHERE name = 'schema-patch-level';
