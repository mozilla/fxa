--  Create the initial set of tables.
--
--  Since this is the first migration, we use `IF NOT EXISTS` to allow us
--  to run this on a db that already has the original schema in place. The
--  patch will then be a no-op.  Subsequent patches should *not* use `IF
--  NOT EXISTS` but should fail noisily if the db is in an unexpected state.

CREATE TABLE IF NOT EXISTS clients (
  id BINARY(8) PRIMARY KEY,
  secret BINARY(32) NOT NULL,
  name VARCHAR(256) NOT NULL,
  imageUri VARCHAR(256) NOT NULL,
  redirectUri VARCHAR(256) NOT NULL,
  whitelisted BOOLEAN DEFAULT FALSE,
  canGrant BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS codes (
  code BINARY(32) PRIMARY KEY,
  clientId BINARY(8) NOT NULL,
  INDEX codes_client_id(clientId),
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  userId BINARY(16) NOT NULL,
  INDEX codes_user_id(userId),
  email VARCHAR(256) NOT NULL,
  scope VARCHAR(256) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS tokens (
  token BINARY(32) PRIMARY KEY,
  clientId BINARY(8) NOT NULL,
  INDEX tokens_client_id(clientId),
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  userId BINARY(16) NOT NULL,
  INDEX tokens_user_id(userId),
  email VARCHAR(256) NOT NULL,
  type VARCHAR(16) NOT NULL,
  scope VARCHAR(256) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

UPDATE dbMetadata SET value = '2' WHERE name = 'schema-patch-level';

