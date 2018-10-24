-- Adds support for Client Developers for OAuth clients

CREATE TABLE developers (
  developerId BINARY(16) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE clientDevelopers (
  rowId BINARY(8) NOT NULL PRIMARY KEY,
  developerId BINARY(16) NOT NULL,
  FOREIGN KEY (developerId) REFERENCES developers(developerId) ON DELETE CASCADE,
  clientId BINARY(8) NOT NULL,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

UPDATE dbMetadata SET value = '4' WHERE name = 'schema-patch-level';
