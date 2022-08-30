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
