CREATE TABLE accounts (
  id VARCHAR(16) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;

UPDATE metadata SET value = '2' WHERE name = 'schema-patch-level';
