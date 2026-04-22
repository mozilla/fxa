SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('190');

DROP TABLE IF EXISTS emailBlocklist;

UPDATE dbMetadata SET value = '189' WHERE name = 'schema-patch-level';
