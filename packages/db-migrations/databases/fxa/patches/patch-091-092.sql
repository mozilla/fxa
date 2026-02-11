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

-- Specify the email string encoding for `inEmail`. MySQL fails to use the
-- correct index in subquery if this is not set.
-- Ref: https://github.com/mozilla/fxa-auth-db-mysql/issues/440
CREATE PROCEDURE `accountRecord_5` (
  IN `inEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin
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
        COALESCE(a.verifierSetAt, a.createdAt) AS profileChangedAt,
        e.normalizedEmail AS primaryEmail
    FROM
        accounts a,
        emails e
    WHERE
        a.uid = (SELECT uid FROM emails WHERE normalizedEmail = LOWER(inEmail))
    AND
        a.uid = e.uid
    AND
        e.isPrimary = true;
END;

UPDATE dbMetadata SET value = '92' WHERE name = 'schema-patch-level';
