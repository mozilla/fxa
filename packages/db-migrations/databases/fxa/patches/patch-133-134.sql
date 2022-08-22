SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- Make sure there are meta data settings for PrunedUntil and LastPrunedAt
INSERT IGNORE INTO dbMetadata (name, value) VALUES ('prunedUntil', '0');

-- We might have gotten ourselves into a state where data was set to an empty string. If so,
-- start it over from zero.
UPDATE dbMetadata SET value = '0' WHERE name = 'prunedUntil' AND value = '';

-- Update prune to limit total number of sessionTokens examined,
-- and avoid producing the above empty-string bug.
--   maxTokenAge - Any token older than this value will be pruned. A value of 0 denotes that pruning is disabled.
--   maxCodeAge  - Any code that was created before now - maxCodeAge will be pruned. A value of 0 denotes pruning is disabled.
--   pruneInterval - The amount of time that must elapse since the previous prune attempt. This guards against inadvertently
--                   running a large number of delete operations in succession.
--   unblockCodesDeleted - Number of unblock codes deleted
--   signInCodesDeleted - Number of sign in codes deleted
--   accountResetTokensDeleted - Number of acount reset tokens deleted
--   passwordForgotTokensDeleted - Number of password forgot tokens deleted
--   passwordChangeTokensDeleted - Number of password change tokens deleted
--   sessionTokensDeleted - Number of session tokens deleted deleted
CREATE PROCEDURE `prune_9` (
  IN `curTime` BIGINT UNSIGNED,
  IN `maxTokenAge` BIGINT UNSIGNED,
  IN `maxCodeAge` BIGINT UNSIGNED,
  OUT `unblockCodesDeleted` INT UNSIGNED,
  OUT `signInCodesDeleted` INT UNSIGNED,
  OUT `accountResetTokensDeleted` INT UNSIGNED,
  OUT `passwordForgotTokensDeleted` INT UNSIGNED,
  OUT `passwordChangeTokensDeleted` INT UNSIGNED,
  OUT `sessionTokensDeleted` INT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SET unblockCodesDeleted = 0;
  SET signInCodesDeleted = 0;
  SET accountResetTokensDeleted = 0;
  SET passwordForgotTokensDeleted = 0;
  SET passwordChangeTokensDeleted = 0;
  SET sessionTokensDeleted = 0;

  SELECT @lockAcquired := GET_LOCK('fxa-auth-server.prune-lock', 3);
  IF @lockAcquired THEN

    IF maxCodeAge > 0 THEN
      DELETE FROM unblockCodes WHERE createdAt < curTime - maxCodeAge ORDER BY createdAt LIMIT 10000;
      SET unblockCodesDeleted = ROW_COUNT();
      DELETE FROM signinCodes  WHERE createdAt < curTime - maxCodeAge ORDER BY createdAt LIMIT 10000;
      SET signInCodesDeleted = ROW_COUNT();
    END IF;

    IF maxTokenAge > 0 THEN
      DELETE FROM accountResetTokens   WHERE createdAt < curTime - maxTokenAge ORDER BY createdAt LIMIT 10000;
      SET accountResetTokensDeleted = ROW_COUNT();
      DELETE FROM passwordForgotTokens WHERE createdAt < curTime - maxTokenAge ORDER BY createdAt LIMIT 10000;
      SET passwordForgotTokensDeleted = ROW_COUNT();
      DELETE FROM passwordChangeTokens WHERE createdAt < curTime - maxTokenAge ORDER BY createdAt LIMIT 10000;
      SET passwordChangeTokensDeleted = ROW_COUNT();

      -- Pruning session tokens is complicated because:
      --   * we can't prune them if there is an associated device record, and
      --   * we have to delete from both sessionTokens and unverifiedTokens tables, and
      --   * MySQL won't allow `LIMIT` to be used in a multi-table delete.
      -- To achieve all this in an efficient manner, we prune tokens within a specific
      -- time window rather than using a `LIMIT` clause.  At the end of each run we
      -- record the new lower-bound on creation time for tokens that might have expired.
      START TRANSACTION;

      -- Step 1: Find out how far we got on previous iterations.
      SELECT @pruneFrom := value FROM dbMetadata WHERE name = 'prunedUntil';

      -- Step 2: Calculate what timestamp we will reach on this iteration
      -- if we purge a sensibly-sized batch of tokens.
      -- N.B. We deliberately do not filter on whether the token has
      -- a device here.  We want to limit the number of tokens that we
      -- *examine*, regardless of whether it actually delete them.
      SELECT @pruneUntil := MAX(createdAt) FROM (
        SELECT createdAt FROM sessionTokens
        WHERE createdAt >= @pruneFrom AND createdAt < curTime - maxTokenAge
        ORDER BY createdAt
        LIMIT 10000
      ) AS candidatesForPruning;

      -- This will be NULL if there are no expired tokens,
      -- in which case we have nothing to do.
      IF @pruneUntil IS NOT NULL THEN

        -- Step 3: relay impacted accounts back to token pruner
        SELECT distinct st.uid
        from sessionTokens AS st
        LEFT JOIN unverifiedTokens AS ut
        ON st.tokenId = ut.tokenId
        WHERE st.createdAt >= @pruneFrom
        AND st.createdAt <= @pruneUntil
        AND NOT EXISTS (
            SELECT sessionTokenId FROM devices
            WHERE uid = st.uid AND sessionTokenId = st.tokenId
        );

        -- Step 4: Prune sessionTokens and unverifiedTokens tables.
        -- Here we *do* filter on whether a device record exists.
        -- We might not actually delete any tokens, but we will definitely
        -- be able to increase 'prunedUntil' for the next run.
        DELETE st, ut
        FROM sessionTokens AS st
        LEFT JOIN unverifiedTokens AS ut
        ON st.tokenId = ut.tokenId
        WHERE st.createdAt >= @pruneFrom
        AND st.createdAt <= @pruneUntil
        AND NOT EXISTS (
            SELECT sessionTokenId FROM devices
            WHERE uid = st.uid AND sessionTokenId = st.tokenId
        );

        SET sessionTokensDeleted = ROW_COUNT();

        -- Step 4: Tell following iterations how far we got.
        UPDATE dbMetadata
        SET value = @pruneUntil
        WHERE name = 'prunedUntil';

      END IF;

    END IF;

    COMMIT;
    SELECT RELEASE_LOCK('fxa-auth-server.prune-lock');

  END IF;

END;

UPDATE dbMetadata SET value = '134' WHERE name = 'schema-patch-level';
