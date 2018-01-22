SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- We might have gotten ourselves into a state where 'sessionTokensPrunedUntil'
-- was set to the empty string.  Start it over from zero.
UPDATE dbMetadata SET value = '0' WHERE name = 'sessionTokensPrunedUntil' AND value = '';

-- Update prune to limit total number of sessionTokens examined,
-- and avoid producing the above empty-string bug.
CREATE PROCEDURE `prune_7` (IN `olderThan` BIGINT UNSIGNED)
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

    -- Pruning session tokens is complicated because:
    --   * we can't prune them if there is an associated device record, and
    --   * we have to delete from both sessionTokens and unverifiedTokens tables, and
    --   * MySQL won't allow `LIMIT` to be used in a multi-table delete.
    -- To achieve all this in an efficient manner, we prune tokens within a specific
    -- time window rather than using a `LIMIT` clause.  At the end of each run we
    -- record the new lower-bound on creation time for tokens that might have expired.
    START TRANSACTION;

    -- Step 1: Find out how far we got on previous iterations.
    SELECT @pruneFrom := value FROM dbMetadata WHERE name = 'sessionTokensPrunedUntil';

    -- Step 2: Calculate what timestamp we will reach on this iteration
    -- if we purge a sensibly-sized batch of tokens.
    -- N.B. We deliberately do not filter on whether the token has
    -- a device here.  We want to limit the number of tokens that we
    -- *examine*, regardless of whether it actually delete them.
    SELECT @pruneUntil := MAX(createdAt) FROM (
      SELECT createdAt FROM sessionTokens
      WHERE createdAt >= @pruneFrom AND createdAt < olderThan
      ORDER BY createdAt
      LIMIT 10000
    ) AS candidatesForPruning;

    -- This will be NULL if there are no expired tokens,
    -- in which case we have nothing to do.
    IF @pruneUntil IS NOT NULL THEN 

      -- Step 3: Prune sessionTokens and unverifiedTokens tables.
      -- Here we *do* filter on whether a device record exists.
      -- We might not actually delete any tokens, but we will definitely
      -- be able to increase 'sessionTokensPrunedUntil' for the next run.
      DELETE st, ut
      FROM sessionTokens AS st
      LEFT JOIN unverifiedTokens AS ut
      ON st.tokenId = ut.tokenId
      WHERE st.createdAt > @pruneFrom
      AND st.createdAt <= @pruneUntil
      AND NOT EXISTS (
        SELECT sessionTokenId FROM devices
        WHERE uid = st.uid AND sessionTokenId = st.tokenId
      );

      -- Step 4: Tell following iterations how far we got.
      UPDATE dbMetadata
      SET value = @pruneUntil
      WHERE name = 'sessionTokensPrunedUntil';

    END IF;

    COMMIT;

    SELECT RELEASE_LOCK('fxa-auth-server.prune-lock');
  END IF;
END;

UPDATE dbMetadata SET value = '69' WHERE name = 'schema-patch-level';

