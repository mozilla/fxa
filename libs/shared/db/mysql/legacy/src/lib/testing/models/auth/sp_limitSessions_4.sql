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
    SET @releasedLock = (SELECT RELEASE_LOCK('fxa-auth-server.prune-lock'));
    RESIGNAL;
  END;

  SET totalDeletions = 0;

  -- Shared with prune_*, so the two never delete concurrently.
  SET @lockAcquired = (SELECT GET_LOCK('fxa-auth-server.prune-lock', 3));
  IF @lockAcquired THEN

    START TRANSACTION;

    -- Rank tokens to keep: device tokens before deviceless ones, newest first.
    -- Everything ranked past maxSessions is deleted, last-ranked first.
    DROP TEMPORARY TABLE IF EXISTS sessionTokensToDelete;
    CREATE TEMPORARY TABLE sessionTokensToDelete
    SELECT tokenId
    FROM (
      SELECT
        st.tokenId AS tokenId,
        ROW_NUMBER() OVER (
          ORDER BY d.id IS NOT NULL DESC, st.createdAt DESC
        ) AS row_num
      FROM sessionTokens AS st
        LEFT JOIN devices AS d
          ON d.uid = accountUid AND d.sessionTokenId = st.tokenId
      WHERE st.uid = accountUid
    ) AS rankedTokens
    WHERE row_num > maxSessions
    ORDER BY row_num DESC
    LIMIT maxTokensDeleted;

    -- Locks the rows so the DELETE below removes exactly the devices returned.
    SELECT d.id, d.refreshTokenId
    FROM devices AS d
      JOIN sessionTokensToDelete AS t ON d.sessionTokenId = t.tokenId
    WHERE d.uid = accountUid
    FOR UPDATE;

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
