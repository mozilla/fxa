-- return accountCreatedAt from the sessionToken stored procedure

CREATE PROCEDURE `sessionToken_3` (
    IN `inTokenId` BINARY(32)
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
        t.lastAccessTime,
        a.emailVerified,
        a.email,
        a.emailCode,
        a.verifierSetAt,
        a.locale,
        a.createdAt AS accountCreatedAt
    FROM
        sessionTokens t,
        accounts a
    WHERE
        t.tokenId = inTokenId
    AND
        t.uid = a.uid
    ;
END;

-- Schema patch-level increment.
UPDATE dbMetadata SET value = '18' WHERE name = 'schema-patch-level';

