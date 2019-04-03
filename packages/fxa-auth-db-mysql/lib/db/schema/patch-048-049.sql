CREATE PROCEDURE `prune_3` (IN `olderThan` BIGINT UNSIGNED)
BEGIN
  SELECT @lockAcquired := GET_LOCK('fxa-auth-server.prune-lock', 3);

  IF @lockAcquired THEN
    DELETE FROM accountResetTokens WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;
    DELETE FROM passwordForgotTokens WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;
    DELETE FROM passwordChangeTokens WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;
    DELETE FROM unblockCodes WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;
    DELETE FROM signinCodes WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;

    SELECT RELEASE_LOCK('fxa-auth-server.prune-lock');
  END IF;
END;

DROP PROCEDURE `expireSigninCodes_1`;

CREATE PROCEDURE `consumeSigninCode_2` (
  IN `hashArg` BINARY(32),
  IN `newerThan` BIGINT UNSIGNED
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
	AND createdAt > newerThan
  );

  DELETE FROM signinCodes
  WHERE hash = hashArg
  AND createdAt > newerThan;

  COMMIT;
END;

UPDATE dbMetadata SET value = '49' WHERE name = 'schema-patch-level';
