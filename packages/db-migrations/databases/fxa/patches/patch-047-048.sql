CREATE TABLE IF NOT EXISTS `signinCodes` (
  hash BINARY(32) NOT NULL PRIMARY KEY,
  uid BINARY(16) NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  INDEX signinCodes_createdAt (createdAt)
) ENGINE=InnoDB;

CREATE PROCEDURE `createSigninCode_1` (
  IN `hashArg` BINARY(32),
  IN `uidArg` BINARY(16),
  IN `createdAtArg` BIGINT UNSIGNED
)
BEGIN
  INSERT INTO signinCodes(hash, uid, createdAt)
  VALUES(hashArg, uidArg, createdAtArg);
END;

CREATE PROCEDURE `consumeSigninCode_1` (
  IN `hashArg` BINARY(32)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT email
  FROM accounts
  WHERE uid = (
    SELECT uid
    FROM signinCodes
    WHERE hash = hashArg
  );

  DELETE FROM signinCodes
  WHERE hash = hashArg;

  COMMIT;
END;

CREATE PROCEDURE `expireSigninCodes_1` (
  IN `olderThan` BIGINT UNSIGNED
)
BEGIN
  DELETE FROM signinCodes
  WHERE createdAt < olderThan;
END;

CREATE PROCEDURE `deleteAccount_13` (
  IN `uidArg` BINARY(16)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DELETE FROM sessionTokens WHERE uid = uidArg;
  DELETE FROM keyFetchTokens WHERE uid = uidArg;
  DELETE FROM accountResetTokens WHERE uid = uidArg;
  DELETE FROM passwordChangeTokens WHERE uid = uidArg;
  DELETE FROM passwordForgotTokens WHERE uid = uidArg;
  DELETE FROM accounts WHERE uid = uidArg;
  DELETE FROM devices WHERE uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  DELETE FROM unblockCodes WHERE uid = uidArg;
  DELETE FROM emails WHERE uid = uidArg;
  DELETE FROM signinCodes WHERE uid = uidArg;

  COMMIT;
END;


UPDATE dbMetadata SET value = '48' WHERE name = 'schema-patch-level';
