-- Drop foreign key constraints.  They make DB migrations harder
-- and aren't really providing us much value in practice.

-- The `clientDevelopers` table needs indexes on `developerId` a `clientId`
-- for fast lookup.  Prior to this patch, we were taking advantage of the
-- index that is automatically created to enforce foreign key constraints,
-- which the MySQL docs at [1] describe as:
--
--   """
--   In the referencing table, there must be an index where the foreign key
--   columns are listed as the first columns in the same order. Such an index
--   is created on the referencing table automatically if it does not exist.
--   This index might be silently dropped later, if you create another index
--   that can be used to enforce the foreign key constraint.
--   """
--   [1] https://dev.mysql.com/doc/refman/5.7/en/create-table-foreign-keys.html
--
-- The "might" in there leaves some doubt about the exact circumstances under
-- which we can depend on this index continuing to exist, so this migration
-- explicitly creates the indexes we need.  It's a two step process:
--
--  1) Explicitly create the indexes we need.  This "might" cause the ones
--     that were created automatically for the FK constraint to be dropped.
--
--  2) Drop the FK constraints, which might leave behind the auto-created
--     indexes if they weren't dropped in (1) above.
--
-- In my testing, the auto-created indexes are indeed dropped in favour
-- of the explicit ones.  If they aren't, then at least we wind up with
-- duplicate indexes which can be cleaned up manually, which is much better
-- than winding up with no indexes at all.
-- 

ALTER TABLE clientDevelopers ADD INDEX idx_clientDevelopers_developerId(developerId),
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE clientDevelopers ADD INDEX idx_clientDevelopers_clientId(clientId),
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE clientDevelopers DROP FOREIGN KEY clientDevelopers_ibfk_1,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE clientDevelopers DROP FOREIGN KEY clientDevelopers_ibfk_2,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE refreshTokens DROP FOREIGN KEY refreshTokens_ibfk_1,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE codes DROP FOREIGN KEY codes_ibfk_1,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE tokens DROP FOREIGN KEY tokens_ibfk_1,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '23' WHERE name = 'schema-patch-level';
