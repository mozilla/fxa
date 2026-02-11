CREATE PROCEDURE `prune_4` (IN `olderThan` BIGINT UNSIGNED)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT @lockAcquired := GET_LOCK('fxa-auth-server.prune-lock', 3);

  IF @lockAcquired THEN
    DELETE FROM accountResetTokens WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;
    DELETE FROM passwordForgotTokens WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;
    DELETE FROM passwordChangeTokens WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;
    DELETE FROM unblockCodes WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;
    DELETE FROM signinCodes WHERE createdAt < olderThan ORDER BY createdAt LIMIT 10000;

    START TRANSACTION;

    DELETE FROM sessionTokens
    WHERE createdAt < olderThan
    AND NOT EXISTS (
      SELECT d.sessionTokenId
      FROM devices AS d
      WHERE d.sessionTokenId = sessionTokens.tokenId
    )
    ORDER BY createdAt
    LIMIT 10000;

    DELETE ut
    FROM unverifiedTokens AS ut
    LEFT JOIN sessionTokens AS st
      ON ut.tokenId = st.tokenId
    WHERE st.tokenId IS NULL;

    COMMIT;

    SELECT RELEASE_LOCK('fxa-auth-server.prune-lock');
  END IF;
END;

UPDATE dbMetadata SET value = '64' WHERE name = 'schema-patch-level';

