-- new sessions stored procedure
CREATE PROCEDURE `sessions_1` (
    IN `uidArg` BINARY(16)
)
BEGIN
    SELECT
        tokenId,
        uid,
        createdAt,
        uaBrowser,
        uaBrowserVersion,
        uaOS,
        uaOSVersion,
        uaDeviceType,
        lastAccessTime
    FROM sessionTokens
    WHERE uid = uidArg;
END;

-- Schema patch-level increment.
UPDATE dbMetadata SET value = '17' WHERE name = 'schema-patch-level';

