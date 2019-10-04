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
  hashedSecret BINARY(32),
  hashedSecretPrevious BINARY(32),
  name VARCHAR(256) NOT NULL,
  imageUri VARCHAR(256) NOT NULL,
  redirectUri VARCHAR(256) NOT NULL,
  canGrant BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trusted BOOLEAN DEFAULT FALSE,
  allowedScopes VARCHAR(1024)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS codes (
  code BINARY(32) PRIMARY KEY,
  clientId BINARY(8) NOT NULL,
  INDEX codes_client_id(clientId),
  userId BINARY(16) NOT NULL,
  INDEX codes_user_id(userId),
  email VARCHAR(256) NOT NULL,
  scope VARCHAR(256) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  authAt BIGINT DEFAULT 0,
  offline BOOLEAN DEFAULT FALSE,
  profileChangedAt BIGINT DEFAULT NULL
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS tokens (
  token BINARY(32) PRIMARY KEY,
  clientId BINARY(8) NOT NULL,
  INDEX tokens_client_id(clientId),
  userId BINARY(16) NOT NULL,
  INDEX tokens_user_id(userId),
  email VARCHAR(256) NOT NULL,
  type VARCHAR(16) NOT NULL,
  scope VARCHAR(256) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP NOT NULL,
  profileChangedAt BIGINT DEFAULT NULL,
  INDEX idx_expiresAt(expiresAt)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS developers (
  developerId BINARY(16) NOT NULL,
  email VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS clientDevelopers (
  rowId BINARY(8) PRIMARY KEY,
  developerId BINARY(16) NOT NULL,
  clientId BINARY(8) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clientDevelopers_developerId(developerId),
  INDEX idx_clientDevelopers_clientId(clientId)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS refreshTokens (
  token BINARY(32) PRIMARY KEY,
  clientId BINARY(8) NOT NULL,
  INDEX tokens_client_id(clientId),
  userId BINARY(16) NOT NULL,
  INDEX tokens_user_id(userId),
  email VARCHAR(256) NOT NULL,
  scope VARCHAR(256) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastUsedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  profileChangedAt BIGINT DEFAULT NULL
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE scopes (
  scope VARCHAR(128) NOT NULL PRIMARY KEY,
  hasScopedKeys BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;
