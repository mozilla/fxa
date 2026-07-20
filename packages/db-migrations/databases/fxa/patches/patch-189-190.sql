SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('189');

CREATE TABLE IF NOT EXISTS emailBlocklist (
  regex VARCHAR(768) NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_emailBlocklist_regex (regex)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

UPDATE dbMetadata SET value = '190' WHERE name = 'schema-patch-level';
