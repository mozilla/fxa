--
--  This file represents the current db schema.
--  It exists mainly for documentation purposes; any automated database
--  modifications are controlled by the files in the ./patches/ directory.
--
--  If you make a change here, you should also create a new database patch
--  file and increment the level in ./patch.js to reflect the change.
--

CREATE TABLE IF NOT EXISTS clients (
  id BINARY(8) PRIMARY KEY,
  secret BINARY(32) NOT NULL,
  name VARCHAR(256) NOT NULL,
  imageUri VARCHAR(256) NOT NULL,
  redirectUri VARCHAR(256) NOT NULL,
  termsUri VARCHAR(256) NOT NULL,
  privacyUri VARCHAR(256) NOT NULL,
  whitelisted BOOLEAN DEFAULT FALSE,
  canGrant BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trusted BOOLEAN DEFAULT FALSE
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
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  authAt BIGINT DEFAULT 0
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

CREATE TABLE IF NOT EXISTS developers (
  developerId BINARY(16) NOT NULL,
  FOREIGN KEY (developerId) REFERENCES developers(developerId) ON DELETE CASCADE,
  clientId BINARY(8) NOT NULL,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS clientDevelopers (
  rowId BINARY(8) PRIMARY KEY,
  developerId BINARY(16) NOT NULL,
  clientId BINARY(8) NOT NULL,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;
