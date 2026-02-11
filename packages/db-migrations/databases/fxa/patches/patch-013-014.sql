-- emailRecord v3
CREATE PROCEDURE `emailRecord_3` (
    IN `inEmail` VARCHAR(255)
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
        a.lockedAt
    FROM
        accounts a
    WHERE
        a.normalizedEmail = LOWER(inEmail)
    ;
END;

-- account v3
CREATE PROCEDURE `account_3` (
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
        a.lockedAt
    FROM
        accounts a
    WHERE
        a.uid = LOWER(inUid)
    ;
END;

UPDATE dbMetadata SET value = '14' WHERE name = 'schema-patch-level';
