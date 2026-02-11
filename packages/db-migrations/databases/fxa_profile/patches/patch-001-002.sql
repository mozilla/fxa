--  Create the initial set of tables.
--
--  Since this is the first migration, we use `IF NOT EXISTS` to allow us
--  to run this on a db that already has the original schema in place. The
--  patch will then be a no-op.  Subsequent patches should *not* use `IF
--  NOT EXISTS` but should fail noisily if the db is in an unexpected state.

CREATE TABLE IF NOT EXISTS avatar_providers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(32) NOT NULL,
  UNIQUE INDEX avatar_providers_name(name)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS avatars (
  id BINARY(16) PRIMARY KEY,
  url VARCHAR(256) NOT NULL,
  userId BINARY(16) NOT NULL,
  INDEX avatars_user_id(userId),
  providerId INT NOT NULL,
  FOREIGN KEY (providerId) REFERENCES avatar_providers(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS avatar_selected (
  userId BINARY(16) NOT NULL PRIMARY KEY,
  avatarId BINARY(16) NOT NULL,
  FOREIGN KEY (avatarId) REFERENCES avatars(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

UPDATE dbMetadata SET value = '2' WHERE name = 'schema-patch-level';

