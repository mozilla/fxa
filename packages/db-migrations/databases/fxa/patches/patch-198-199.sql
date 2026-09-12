SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('198');

CREATE TABLE IF NOT EXISTS featureFlags (
  name VARCHAR(64) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  description VARCHAR(255) NOT NULL DEFAULT '',
  updatedAt BIGINT UNSIGNED NOT NULL,
  updatedBy VARCHAR(255) NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

UPDATE dbMetadata SET value = '199' WHERE name = 'schema-patch-level';
