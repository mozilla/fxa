SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('202');

DROP TABLE IF EXISTS featureFlags;

UPDATE dbMetadata SET value = '201' WHERE name = 'schema-patch-level';
