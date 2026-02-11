SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- Add an index on sessionTokens::createdAt to make pruning faster.
CREATE INDEX `sessionTokens_createdAt`
ON `sessionTokens` (`createdAt`)
ALGORITHM=INPLACE
LOCK=NONE;

-- Used to prevent session token pruning from doing a full table scan
-- as it proceeds further and further through the (very long) backlog
-- of pruning candidates.
INSERT INTO dbMetadata (name, value)
VALUES ('sessionTokensPrunedUntil', 0);

-- Update prune to delete sessionTokens and unverifiedTokens.
CREATE PROCEDURE `prune_6` (IN `olderThan` BIGINT UNSIGNED)
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

    -- Pruning session tokens is more complicated because we can't
    -- prune them if there is an associated device record.
    START TRANSACTION;

    -- Step 1: Find out how far we got on previous iterations.
    SELECT @pruneFrom := value FROM dbMetadata WHERE name = 'sessionTokensPrunedUntil';

    -- Step 2: Find out how far we will get on this iteration.
    SELECT @pruneUntil := MAX(createdAt) FROM (
      SELECT createdAt FROM sessionTokens
      WHERE createdAt >= @pruneFrom AND createdAt < olderThan
      AND NOT EXISTS (
        SELECT sessionTokenId FROM devices
        WHERE uid = sessionTokens.uid
        AND sessionTokenId = sessionTokens.tokenId
      )
      ORDER BY createdAt
      LIMIT 10000
    ) AS prunees;

    -- Step 3: Prune sessionTokens and unverifiedTokens.
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

    COMMIT;

    SELECT RELEASE_LOCK('fxa-auth-server.prune-lock');
  END IF;
END;

UPDATE dbMetadata SET value = '67' WHERE name = 'schema-patch-level';

