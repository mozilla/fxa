SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('91');

-- Removes the LOWER(inUid) requirement on the WHERE clause
CREATE PROCEDURE `account_6` (
    IN `inUid` BINARY(16)
)
BEGIN
    SELECT
        a.uid,
        a.email,
        a.normalizedEmail,
        a.emailVerified,
        a.emailCode,
        a.kA,
        a.wrapWrapKb,
        a.verifierVersion,
        a.authSalt,
        a.verifierSetAt,
        a.createdAt,
        a.locale,
        a.lockedAt,
        COALESCE(a.verifierSetAt, a.createdAt) AS profileChangedAt
    FROM
        accounts a
    WHERE
        a.uid = inUid
    ;
END;

UPDATE dbMetadata SET value = '92' WHERE name = 'schema-patch-level';
