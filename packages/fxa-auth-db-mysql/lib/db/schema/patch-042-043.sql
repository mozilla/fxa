-- Add index to unblockCodes table
CREATE INDEX unblockCodes_createdAt
ON unblockCodes (createdAt)
ALGORITHM = INPLACE LOCK = NONE;

-- New prune procedure
CREATE PROCEDURE `prune_2` (IN pruneTokensOlderThanDate BIGINT UNSIGNED)
BEGIN
    -- try and obtain the prune lock
    SELECT @lockAcquired:=GET_LOCK('fxa-auth-server.prune-lock', 3);

    IF @lockAcquired THEN

      DELETE FROM accountResetTokens WHERE createdAt < pruneTokensOlderThanDate ORDER BY createdAt LIMIT 10000;
      DELETE FROM passwordForgotTokens WHERE createdAt < pruneTokensOlderThanDate ORDER BY createdAt LIMIT 10000;
      DELETE FROM passwordChangeTokens WHERE createdAt < pruneTokensOlderThanDate ORDER BY createdAt LIMIT 10000;
      DELETE FROM unblockCodes WHERE createdAt < pruneTokensOlderThanDate ORDER BY createdAt LIMIT 10000;

      -- release the lock
      SELECT RELEASE_LOCK('fxa-auth-server.prune-lock');

    END IF;

END;

UPDATE dbMetadata SET value = '43' WHERE name = 'schema-patch-level';
