-- Add refreshTokens

CREATE TABLE refreshTokens (
  token BINARY(32) PRIMARY KEY,
  clientId BINARY(8) NOT NULL,
  INDEX tokens_client_id(clientId),
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  userId BINARY(16) NOT NULL,
  INDEX tokens_user_id(userId),
  email VARCHAR(256) NOT NULL,
  scope VARCHAR(256) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

-- Add expiresAt column for access tokens

ALTER TABLE tokens ADD COLUMN expiresAt TIMESTAMP NOT NULL DEFAULT "1980-01-01 00:00:00";
UPDATE tokens SET expiresAt = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 WEEK);

-- Add offline column to codes

ALTER TABLE codes ADD COLUMN offline BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE dbMetadata SET value = '6' WHERE name = 'schema-patch-level';
