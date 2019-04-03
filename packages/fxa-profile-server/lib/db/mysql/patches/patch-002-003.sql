--  Create the initial set of tables.
--
--  Since this is the first migration, we use `IF NOT EXISTS` to allow us
--  to run this on a db that already has the original schema in place. The
--  patch will then be a no-op.  Subsequent patches should *not* use `IF
--  NOT EXISTS` but should fail noisily if the db is in an unexpected state.

CREATE TABLE IF NOT EXISTS profile (
  userId BINARY(16) NOT NULL PRIMARY KEY,
  displayName VARCHAR(256)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

UPDATE dbMetadata SET value = '3' WHERE name = 'schema-patch-level';

