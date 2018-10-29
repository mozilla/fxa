-- Drop foreign key constraints.  They make DB migrations harder
-- and aren't really providing us much value in practice.
--
-- We previously attempted this in migration #23, but had to roll
-- it back because it caused MySQL's query planner to make some poor
-- choices.  We've re-worked the queries to help it make better
-- choices and are now ready to try again.

ALTER TABLE refreshTokens DROP FOREIGN KEY refreshTokens_ibfk_1,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE codes DROP FOREIGN KEY codes_ibfk_1,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE tokens DROP FOREIGN KEY tokens_ibfk_1,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '26' WHERE name = 'schema-patch-level';
