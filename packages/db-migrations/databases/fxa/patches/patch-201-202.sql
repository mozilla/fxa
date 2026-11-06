SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('201');

-- Trims an account to maxSessions session tokens. Tokens without a device are
-- deleted first, oldest first; tokens with a device go only once those run out.
-- Deleting a device skips the disconnect side effects the auth-server runs, so
-- the devices about to be deleted come back as a result set (id,
-- refreshTokenId) for the caller to finish. totalDeletions counts session
-- tokens only.
--   accountUid       - The account to target
--   maxSessions      - Max number of sessions allowed per account
--   maxTokensDeleted - Max number of session tokens to delete per call
CREATE PROCEDURE `limitSessions_4` (
  IN `accountUid` BINARY(16),
  IN `maxSessions` INT UNSIGNED,
  IN `maxTokensDeleted` INT UNSIGNED,
  OUT `totalDeletions` INT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SET totalDeletions = 0;

  -- Shared with prune_*, so the two never delete concurrently.
  SET @lockAcquired = (SELECT GET_LOCK('fxa-auth-server.prune-lock', 3));
  IF @lockAcquired THEN

    START TRANSACTION;

    -- Rank tokens to keep: device tokens before deviceless ones, newest first.
    -- Everything ranked past maxSessions is deleted, last-ranked first.
    SET @counter := 0;
    DROP TEMPORARY TABLE IF EXISTS sessionTokensToDelete;
    CREATE TEMPORARY TABLE sessionTokensToDelete
    SELECT tokenId
    FROM (
      SELECT
        @counter:=@counter+1 AS row_num,
        tokenId
      FROM (
        SELECT
          st.tokenId AS tokenId,
          st.createdAt AS createdAt,
          d.id IS NOT NULL AS hasDevice
        FROM sessionTokens AS st
          LEFT JOIN devices AS d
            ON d.uid = accountUid AND d.sessionTokenId = st.tokenId
        WHERE st.uid = accountUid
        ORDER BY hasDevice DESC, createdAt DESC
        -- The LIMIT stops MySQL discarding this ORDER BY when it merges the
        -- derived table, which would number rows in arbitrary order.
        LIMIT 18446744073709551615
      ) AS orderedTokens
    ) AS numberedTokens
    WHERE row_num > maxSessions
    ORDER BY row_num DESC
    LIMIT maxTokensDeleted;

    SELECT d.id, d.refreshTokenId
    FROM devices AS d
      JOIN sessionTokensToDelete AS t ON d.sessionTokenId = t.tokenId
    WHERE d.uid = accountUid;

    SELECT COUNT(*) INTO totalDeletions FROM sessionTokensToDelete;

    DELETE st, ut, d
    FROM sessionTokens AS st
      LEFT JOIN unverifiedTokens AS ut ON st.tokenId = ut.tokenId
      LEFT JOIN devices AS d ON d.sessionTokenId = st.tokenId AND d.uid = accountUid
    WHERE
      st.tokenId IN (
        SELECT tokenId FROM sessionTokensToDelete
      );

    DROP TEMPORARY TABLE sessionTokensToDelete;

    COMMIT;

  END IF;

  SET @releasedLock = (SELECT RELEASE_LOCK('fxa-auth-server.prune-lock'));

END;

UPDATE dbMetadata SET value = '202' WHERE name = 'schema-patch-level';
