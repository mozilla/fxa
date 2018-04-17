SET NAMES utf8mb4 COLLATE utf8mb4_bin;

ALTER TABLE recoveryCodes MODIFY COLUMN codeHash BINARY(32);

ALTER TABLE recoveryCodes ADD COLUMN salt BINARY(32);

CREATE PROCEDURE `recoveryCodes_1` (
  IN `uidArg` BINARY(16)
)
BEGIN

  SELECT * FROM recoveryCodes WHERE uid = uidArg;

END;

CREATE PROCEDURE `consumeRecoveryCode_2` (
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

  SET @deletedCount = 0;

  DELETE FROM `recoveryCodes` WHERE `uid` = `uidArg` AND `codeHash` = `codeHashArg`;

  SELECT ROW_COUNT() INTO @deletedCount;
  IF @deletedCount = 0 THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Unknown recovery code.';
  END IF;

  SELECT COUNT(*) AS count FROM `recoveryCodes` WHERE `uid` = `uidArg`;

  COMMIT;
END;

CREATE PROCEDURE `createRecoveryCode_2` (
  IN `uidArg` BINARY(16),
  IN `codeHashArg` BINARY(32),
  IN `saltArg` BINARY(32)
)
BEGIN

  INSERT INTO recoveryCodes (uid, codeHash, salt, createdAt) VALUES (uidArg, codeHashArg, saltArg, NOW());

END;

UPDATE dbMetadata SET value = '79' WHERE name = 'schema-patch-level';

