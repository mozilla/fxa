SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('199');

DROP TABLE IF EXISTS featureFlags;

UPDATE dbMetadata SET value = '198' WHERE name = 'schema-patch-level';
