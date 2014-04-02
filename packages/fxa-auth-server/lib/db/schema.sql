CREATE TABLE IF NOT EXISTS clients (
  id BINARY(16) PRIMARY KEY,
  secret BINARY(32) NOT NULL,
  name VARCHAR(256) NOT NULL,
  imageUri VARCHAR(256) NOT NULL,
  redirectUri VARCHAR(256) NOT NULL,
  whitelisted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS codes (
  code BINARY(32) PRIMARY KEY,
  clientId BINARY(16) NOT NULL,
  INDEX codes_client_id(clientId),
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  userId BINARY(16) NOT NULL,
  INDEX codes_user_id(userId),
  email VARCHAR(256) NOT NULL,
  scope VARCHAR(256) NOT NULL,
  createdAt TIMESTAMP NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tokens (
  token BINARY(32) PRIMARY KEY,
  clientId BINARY(16) NOT NULL,
  INDEX tokens_client_id(clientId),
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  userId BINARY(16) NOT NULL,
  INDEX tokens_user_id(userId),
  email VARCHAR(256) NOT NULL,
  type VARCHAR(16) NOT NULL,
  scope VARCHAR(256) NOT NULL,
  createdAt TIMESTAMP NOT NULL
) ENGINE=InnoDB;
