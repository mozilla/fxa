SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('192');

DROP TABLE IF EXISTS domainBlocklist;

UPDATE dbMetadata SET value = '191' WHERE name = 'schema-patch-level';
