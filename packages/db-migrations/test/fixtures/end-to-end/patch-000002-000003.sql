CREATE TABLE kv (
  name VARCHAR(255) NOT NULL PRIMARY KEY,
  value VARCHAR(255) NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;

UPDATE metadata SET value = '3' WHERE name = 'schema-patch-level';
