SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('178');

-- In practice, this stored procedure ended up being slower than the original despite
-- the optimizer hints, and fewer rows from the CTE filtering first. Code should still
-- reference accountDevices_17, but this will be left so we don't have to drop the procedure.

-- This migration updates the attachedDevices sproc to optimize performance
-- using CTE and MySQL 8 optimizer hints, limiting fan-out during joins to
-- deviceCommands and deviceCommandIdentifiers.


CREATE PROCEDURE `accountDevices_18` (
  IN `uidArg` BINARY(16),
  IN `limitArg` INT
)
BEGIN
  WITH d0 AS (
    SELECT
      uid,
      id,
      sessionTokenId,
      refreshTokenId,
      nameUtf8,
      type,
      createdAt,
      callbackURL,
      callbackPublicKey,
      callbackAuthKey,
      callbackIsExpired
    FROM devices as d
    WHERE uid = uidArg
      AND (
      d.refreshTokenId IS NOT NULL
      OR EXISTS (
        -- This is to prevent the zombie devices, but also to ensure
        -- we return an accurate count of devices. If devices 1-3 are are
        -- valid, 4 isn't and 5 is, and our limit is 4, we would
        -- miss device 5 without this check.
        SELECT 1
        FROM sessionTokens st
        WHERE st.tokenId = d.sessionTokenId
      )
    )
    ORDER BY id
    LIMIT limitArg
  )
  -- MYSQL8 hints to improve joins to deviceCommands
  SELECT /*+ JOIN_ORDER(d0, s, dc, ci) NO_HASH_JOIN(d0, dc) INDEX(dc PRIMARY) */
    d0.uid,
    d0.id,
    s.tokenId AS sessionTokenId,
    d0.refreshTokenId,
    d0.nameUtf8 AS name,
    d0.type,
    d0.createdAt,
    d0.callbackURL,
    d0.callbackPublicKey,
    d0.callbackAuthKey,
    d0.callbackIsExpired,
    s.uaBrowser,
    s.uaBrowserVersion,
    s.uaOS,
    s.uaOSVersion,
    s.uaDeviceType,
    s.uaFormFactor,
    s.lastAccessTime,
    ci.commandName,
    dc.commandData
  FROM d0
  LEFT JOIN sessionTokens s ON s.tokenId = d0.sessionTokenId
  LEFT JOIN deviceCommands dc ON dc.uid = d0.uid AND dc.deviceId = d0.id
  LEFT JOIN deviceCommandIdentifiers ci ON ci.commandId = dc.commandId
  ORDER BY d0.id;
END;

UPDATE dbMetadata SET value = '179' WHERE name = 'schema-patch-level';
