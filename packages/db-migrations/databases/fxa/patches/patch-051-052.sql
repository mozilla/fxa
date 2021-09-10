CREATE PROCEDURE `accountEmails_3` (
    IN `inUid` BINARY(16)
)
BEGIN
	(SELECT
        a.normalizedEmail,
        a.email,
        a.uid,
        a.emailCode,
        a.emailVerified AS isVerified,
        TRUE AS isPrimary,
        a.createdAt
    FROM
        accounts a
    WHERE
        uid = inUid)

    UNION DISTINCT

    (SELECT
        e.normalizedEmail,
        e.email,
        e.uid,
        e.emailCode,
        e.isVerified,
        e.isPrimary,
        e.createdAt
    FROM
        emails e
    WHERE
        uid = inUid)
    ORDER BY isPrimary DESC;
END;

UPDATE dbMetadata SET value = '52' WHERE name = 'schema-patch-level';
