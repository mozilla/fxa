SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('99');

CREATE PROCEDURE `fetchSecurityEventsByUid_1` (
    IN inUid BINARY(16)
)
BEGIN
    SELECT
        n.name,
        e.verified,
        e.createdAt
    FROM
        securityEvents e
    LEFT JOIN securityEventNames n
        ON e.nameId = n.id
    WHERE
        e.uid = inUid
    ORDER BY e.createdAt DESC
    LIMIT 100;
END;

CREATE PROCEDURE `deleteSecurityEventsByUid_1` (
  IN `inUid` BINARY(16)
)
BEGIN
  DELETE FROM securityEvents WHERE uid = inUid;
END;

UPDATE dbMetadata SET value = '100' WHERE name = 'schema-patch-level';
