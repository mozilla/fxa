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
