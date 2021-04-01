-- -- Create paypalCustomers table to store the relationship between FxA users and PayPal
-- -- This table can be joined with the existing accountCustomers table on the uid to map
-- -- a PayPal user to their stripeCustomerId.
-- -- endedAt is nullable by default, since active billing agreements would not have a value
-- -- A user can have more than one billing agreement e.g. if the funding becomes invalid
-- -- for the first one. This means there can be more than one row in the table for a given
-- -- FxA user, so we make a composite key as the primary key.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('114');

ALTER TABLE accounts ADD COLUMN disabledAt BIGINT UNSIGNED DEFAULT NULL;

CREATE PROCEDURE `accountRecord_8` (
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

UPDATE dbMetadata SET value = '115' WHERE name = 'schema-patch-level';
