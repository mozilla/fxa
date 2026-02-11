CREATE TABLE IF NOT EXISTS unblockCodes (
  uid BINARY(16) NOT NULL,
  unblockCodeHash BINARY(32) NOT NULL,
  createdAt BIGINT SIGNED NOT NULL,
  PRIMARY KEY(uid, unblockCodeHash)
) ENGINE=InnoDB;

CREATE PROCEDURE `createUnblockCode_1` (
    IN inUid BINARY(16),
    IN inCodeHash BINARY(32),
    IN inCreatedAt BIGINT SIGNED
)
BEGIN
    INSERT INTO unblockCodes(
        uid,
        unblockCodeHash,
        createdAt
    )
    VALUES(
        inUid,
        inCodeHash,
        inCreatedAt
    );
END;

CREATE PROCEDURE `consumeUnblockCode_1` (
    inUid BINARY(16),
    inCodeHash BINARY(32)
)
BEGIN
    DECLARE timestamp BIGINT;
    SET @timestamp = (
        SELECT createdAt FROM unblockCodes
        WHERE
            uid = inUid
        AND
            unblockCodeHash = inCodeHash
    );

    DELETE FROM unblockCodes
    WHERE
        uid = inUid
    AND
        unblockCodeHash = inCodeHash;

    SELECT @timestamp AS createdAt;
END;

-- Update deleteAccount to remove unblockCodes
CREATE PROCEDURE `deleteAccount_10` (
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

  INSERT INTO eventLog(
    uid,
    typ,
    iat
  )
  VALUES(
    uidArg,
    "delete",
    UNIX_TIMESTAMP()
  );

  COMMIT;
END;


UPDATE dbMetadata SET value = '35' WHERE name = 'schema-patch-level';
