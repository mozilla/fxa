SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('132');


-- This migration adds a routine for removing sessions on accounts that have
-- over maxSessions. Essentially, per account tokens above maxSessions
-- will be purged. Older tokens will be removed first. Associated unverified
-- tokens and devices will also be removed.
--   maxSessions - Max number of sessions allowed per account
--   accountsOverLimit - Number of accounts having more than the allowed session token limit
--   totalDeletions - Total number of rows deleted, which includes session token rows, unverified session token rows and device rows.
CREATE PROCEDURE `limitSessions_1` (
  IN `maxSessions` INT UNSIGNED,
  OUT `accountsOverLimit` INT UNSIGNED,
  OUT `totalDeletions` INT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SET accountsOverLimit = 0;
  SET totalDeletions = 0;

  -- We will share a lock between this procedure and the prune_* procedure. The code should
  -- invoke these sequentially, but this is an extra guard.
  SELECT @lockAcquired := GET_LOCK('fxa-auth-server.prune-lock', 3);
  IF @lockAcquired THEN

    -- First create a temp table containing just the accounts having too many sessions
    -- In practice, this should be a small percentage of all accounts, assuming that
    -- maxSessions is adequately large. This let's subsequent queries efficiently target
    -- a subset of data needs to be deleted. Furhtermore this query is limitted to 1000
    -- accounts to constrain the scope of the delete.
    DROP TEMPORARY TABLE IF EXISTS tokenCounts;
    CREATE TEMPORARY TABLE tokenCounts
      SELECT uid
      from (
        SELECT uid, COUNT(tokenId) as tokenCount
        FROM sessionTokens
        group by uid
      ) as counts
      where tokenCount > maxSessions
      limit 1000;

    -- Report back the number of accounts over the limit
    SET accountsOverLimit = (SELECT COUNT(uid) from tokenCounts);

    -- For the accounts having too many tokens, generate row numbers.
    -- row_num resets everytime uid changes.
    SET @counter := 0;
    SET @uid_no := (SELECT uid from tokenCounts order by uid limit 1);
    DROP TEMPORARY TABLE IF EXISTS sessionTokenCounted;
    CREATE TEMPORARY TABLE sessionTokenCounted SELECT
      @counter:=CASE
        WHEN @uid_no = uid
          THEN @counter + 1
        ELSE 0
      END AS row_num,
      @uid_no:=uid as uid,
      createdAt as createdAt,
      tokenid as tokenId
    FROM
      (
        -- Create a table where tokens are sorted first by the account uid and then
        -- createdAt.
        SELECT uid, createdAt, tokenId
        FROM sessionTokens
        WHERE uid in (
          SELECT uid
          FROM tokenCounts
        )
        ORDER BY uid, createdAt
      ) as orderedTokens;


    -- Finally remove any tokens above max count. Associated devices and unverified
    -- tokens can be removed as well.
    DELETE st, ut, devices
    FROM sessionTokens as st
      LEFT JOIN unverifiedTokens AS ut ON st.tokenId = ut.tokenId
      LEFT JOIN devices ON devices.sessionTokenId = st.tokenId
    WHERE
      st.tokenId IN (
        SELECT tokenId
        FROM sessionTokenCounted
        WHERE row_num > maxSessions
      );

    -- Report back the number of rows deleted
    SET totalDeletions = ROW_COUNT();

    -- RETURN THE ACCOUNTS IMPACTED
    SELECT uid from tokenCounts;
  END IF;

  COMMIT;
  SELECT RELEASE_LOCK('fxa-auth-server.prune-lock');

END;

UPDATE dbMetadata SET value = '133' WHERE name = 'schema-patch-level';
