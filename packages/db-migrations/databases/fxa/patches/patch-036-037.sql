--
-- Remove the log of account lifecycle events.
-- It's pretty clear we're not going to do anything with it,
-- and it's just costing us DB writes and disk space.
--
-- We have to do this in two parts.  First, we update the
-- stored procedures that are currently writing to that
-- table, and stop doing so.  Only once that's fully deployed
-- and no old webheads are executing the old stored procedures,
-- can we do the following in a follow-up migration:
--
--  DROP TABLE eventLog
--  DROP TABLE eventLogPublishState
--

CREATE PROCEDURE `createAccount_5` (
    IN `uid` BINARY(16) ,
    IN `normalizedEmail` VARCHAR(255),
    IN `email` VARCHAR(255),
    IN `emailCode` BINARY(16),
    IN `emailVerified` TINYINT(1),
    IN `kA` BINARY(32),
    IN `wrapWrapKb` BINARY(32),
    IN `authSalt` BINARY(32),
    IN `verifierVersion` TINYINT UNSIGNED,
    IN `verifyHash` BINARY(32),
    IN `verifierSetAt` BIGINT UNSIGNED,
    IN `createdAt` BIGINT UNSIGNED,
    IN `locale` VARCHAR(255)
)
BEGIN
    INSERT INTO accounts(
        uid,
        normalizedEmail,
        email,
        emailCode,
        emailVerified,
        kA,
        wrapWrapKb,
        authSalt,
        verifierVersion,
        verifyHash,
        verifierSetAt,
        createdAt,
        locale
    )
    VALUES(
        uid,
        LOWER(normalizedEmail),
        email,
        emailCode,
        emailVerified,
        kA,
        wrapWrapKb,
        authSalt,
        verifierVersion,
        verifyHash,
        verifierSetAt,
        createdAt,
        locale
    );
END;


CREATE PROCEDURE `verifyEmail_3` (
    IN `inUid` BINARY(16)
)
BEGIN
    UPDATE accounts SET emailVerified = true WHERE uid = inUid;
END;


CREATE PROCEDURE `resetAccount_8` (
  IN `uidArg` BINARY(16),
  IN `verifyHashArg` BINARY(32),
  IN `authSaltArg` BINARY(32),
  IN `wrapWrapKbArg` BINARY(32),
  IN `verifierSetAtArg` BIGINT UNSIGNED,
  IN `VerifierVersionArg` TINYINT UNSIGNED
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
  DELETE FROM devices WHERE uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;

  UPDATE accounts
  SET
    verifyHash = verifyHashArg,
    authSalt = authSaltArg,
    wrapWrapKb = wrapWrapKbArg,
    verifierSetAt = verifierSetAtArg,
    verifierVersion = verifierVersionArg
  WHERE uid = uidArg;

  COMMIT;
END;


CREATE PROCEDURE `deleteAccount_11` (
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

  COMMIT;
END;

-- Schema patch-level increment.
UPDATE dbMetadata SET value = '37' WHERE name = 'schema-patch-level';
