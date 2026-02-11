-- This restores some of the FOREIGN KEY constraints that were
-- dropped in migration #23.  They unexpectedly caused MySQL to
-- change its query plan and start scanning large chunks of the
-- `tokens` table.  More context here:
--
--     https://github.com/mozilla/fxa-auth-server/issues/2695
--
-- We'll remove them again in a follow-up migration, and adjust
-- the queries to ensure they use the right indexes.  For now
-- we're just putting them back so that the alleged state of
-- the db matches what's in production.

SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE refreshTokens ADD FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE codes ADD FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE tokens ADD FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
ALGORITHM = INPLACE, LOCK = NONE;

SET FOREIGN_KEY_CHECKS=1;

UPDATE dbMetadata SET value = '25' WHERE name = 'schema-patch-level';
