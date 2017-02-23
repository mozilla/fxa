-- Update email record to return `createdAt`
-- emailRecord v4
CREATE PROCEDURE `emailRecord_4` (
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
        a.lockedAt,
        a.createdAt
    FROM
        accounts a
    WHERE
        a.normalizedEmail = LOWER(inEmail)
    ;
END;

UPDATE dbMetadata SET value = '44' WHERE name = 'schema-patch-level';
