SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- Reinstate the code from prune_3
CREATE PROCEDURE `prune_5` (IN `olderThan` BIGINT UNSIGNED)
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

UPDATE dbMetadata SET value = '66' WHERE name = 'schema-patch-level';

