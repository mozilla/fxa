ALTER TABLE clients
ADD COLUMN allowedScopes VARCHAR(1024) AFTER trusted,
ALGORITHM = INPLACE, LOCK = NONE;

CREATE TABLE scopes (
  scope VARCHAR(128) NOT NULL PRIMARY KEY,
  hasScopedKeys BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

UPDATE dbMetadata SET value = '20' WHERE name = 'schema-patch-level';
