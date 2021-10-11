SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('120');

ALTER TABLE accounts
  ADD COLUMN metricsOptOutAt BIGINT UNSIGNED DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

-- add metricsOptOutAt to accountRecord_* proc
CREATE PROCEDURE `accountRecord_9` (
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
        a.disabledAt,
        COALESCE(a.profileChangedAt, a.verifierSetAt, a.createdAt) AS profileChangedAt,
        COALESCE(a.keysChangedAt, a.verifierSetAt, a.createdAt) AS keysChangedAt,
        a.ecosystemAnonId,
        a.metricsOptOutAt,
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

UPDATE dbMetadata SET value = '121' WHERE name = 'schema-patch-level';
