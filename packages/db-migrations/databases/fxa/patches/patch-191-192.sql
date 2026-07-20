SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('191');

CREATE TABLE IF NOT EXISTS domainBlocklist (
  domain VARCHAR(253) NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_domainBlocklist_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

UPDATE dbMetadata SET value = '192' WHERE name = 'schema-patch-level';
