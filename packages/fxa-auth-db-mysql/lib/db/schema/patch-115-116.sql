--
-- This migration uses the `JSON_OBJECTAGG` function to aggregate available device commands.
-- Previously we were using a helper function `aggregateNameValuePairs` introduced in
-- https://github.com/mozilla/fxa-auth-db-mysql/pull/354
--
-- Some things to note in this migration, `JSON_OBJECTAGG` errors if any key is NULL,
-- which might happen when joining deviceCommands and deviceCommandIdentifiers tables.
-- To handle this, the procedure replaces NULL values with a specific named key, which
-- then gets removed by `JSON_REMOVE`. The procedure `sessionWithDevice_19` is hit
-- a lot by many routes so the performance impact of this is TBD.
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('115');

-- Per https://dev.mysql.com/doc/refman/5.7/en/group-by-handling.html
-- MySQL will reject the query because it "uses nonaggregated columns that are
-- neither named in the GROUP BY clause nor are functionally dependent on them".
SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

CREATE PROCEDURE `sessionWithDevice_19` (
  IN `tokenIdArg` BINARY(32)
)
BEGIN
  SELECT
    t.tokenData,
    t.uid,
    t.createdAt,
    t.uaBrowser,
    t.uaBrowserVersion,
    t.uaOS,
    t.uaOSVersion,
    t.uaDeviceType,
    t.uaFormFactor,
    t.lastAccessTime,
    t.verificationMethod,
    t.verifiedAt,
    COALESCE(t.authAt, t.createdAt) AS authAt,
    e.isVerified AS emailVerified,
    e.email,
    e.emailCode,
    a.verifierSetAt,
    a.locale,
    COALESCE(a.profileChangedAt, a.verifierSetAt, a.createdAt) AS profileChangedAt,
    COALESCE(a.keysChangedAt, a.verifierSetAt, a.createdAt) AS keysChangedAt,
    a.createdAt AS accountCreatedAt,
    d.id AS deviceId,
    d.nameUtf8 AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey,
    d.callbackIsExpired AS deviceCallbackIsExpired,
    ut.tokenVerificationId,
    dac.deviceAvailableCommands,
    COALESCE(t.mustVerify, ut.mustVerify) AS mustVerify
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN emails AS e
    ON t.uid = e.uid
    AND e.isPrimary = true
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  LEFT JOIN (
    (SELECT dc.uid, dc.deviceId, JSON_OBJECTAGG(ci.commandName, dc.commandData) AS deviceAvailableCommands
    FROM deviceCommands AS dc FORCE INDEX (PRIMARY)
		INNER JOIN deviceCommandIdentifiers AS ci FORCE INDEX (PRIMARY)
		ON ci.commandId = dc.commandId WHERE ci.commandName IS NOT NULL
        GROUP BY dc.uid
    ) AS dac )
    ON (dac.uid = d.uid AND dac.deviceId = d.id)
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

UPDATE dbMetadata SET value = '116' WHERE name = 'schema-patch-level';
