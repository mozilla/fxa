SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('134');

-- Finds accounts with high numbers of sessions. Note this can be expensive. Run sparingly.
CREATE PROCEDURE `findLargeAccounts_1` (
  IN `sessionsRequired` INT UNSIGNED,
  IN `rowLimit` INT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- We will share a lock between this procedure and the prune_* procedure. The code should
  -- invoke these sequentially, but this is an extra guard. Running this query while a pruning
  -- operation is in progress doesn't make a lot of sense.
  SET @lockAcquired = (SELECT GET_LOCK('fxa-auth-server.prune-lock', 3));
  IF @lockAcquired THEN
    SELECT uid
    FROM (
      SELECT uid, COUNT(tokenId) AS tokenCount
      FROM sessionTokens
      GROUP BY uid
    ) AS counts
    WHERE tokenCount > sessionsRequired
    ORDER BY tokenCount DESC
    LIMIT rowLimit;
  END IF;

  COMMIT;
  SET @lockReleased = (SELECT RELEASE_LOCK('fxa-auth-server.prune-lock'));
END;

-- This migration adds a routine for removing sessions on accounts that have
-- over maxSessions. Essentially, per account tokens above maxSessions
-- will be purged. Older tokens will be removed first. Associated unverified
-- tokens and devices will also be removed.
--   accountUid  - The account to target
--   maxSessions - Max number of sessions allowed per account
--   maxTokensDeleted - Max number of session tokens to delete at a time. This is another safeguard, since we don't know how many sessions each account has ahead of time.
--   totalDeletions - Total number of rows deleted, which includes session token rows, unverified session token rows, and device rows.
CREATE PROCEDURE `limitSessions_2` (
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

  -- We will share a lock between this procedure and the prune_* procedure. The code should
  -- invoke these sequentially, but this is an extra guard.
  SET @lockAcquired = (SELECT GET_LOCK('fxa-auth-server.prune-lock', 3));
  IF @lockAcquired THEN

    -- For the accounts having too many tokens, generate row numbers so we can pick
    -- anything over the 'maxSessions' allowed.
    SET @counter := 0;
    DROP TEMPORARY TABLE IF EXISTS sessionTokenCounted;
    CREATE TEMPORARY TABLE sessionTokenCounted
    SELECT tokenId
    FROM (
      SELECT
        @counter:=@counter+1 AS row_num,
        createdAt AS createdAt,
        tokenid AS tokenId
      FROM
        sessionTokens
      WHERE
        uid = accountUid
      ORDER BY createdAt DESC
    ) as orderedTokens
    WHERE row_num > maxSessions
    ORDER BY row_num DESC
    LIMIT maxTokensDeleted;


    -- Finally remove any tokens above max count. Associated devices and unverified
    -- tokens can be removed as well.
    DELETE st, ut, devices
    FROM sessionTokens AS st
      LEFT JOIN unverifiedTokens AS ut ON st.tokenId = ut.tokenId
      LEFT JOIN devices ON devices.sessionTokenId = st.tokenId
    WHERE
      st.tokenId IN (
        SELECT tokenId from sessionTokenCounted
      );

    -- Report back the number of rows deleted
    SET totalDeletions = ROW_COUNT();

  END IF;

  COMMIT;
  SET @releasedLock = (SELECT RELEASE_LOCK('fxa-auth-server.prune-lock'));

END;

UPDATE dbMetadata SET value = '135' WHERE name = 'schema-patch-level';
