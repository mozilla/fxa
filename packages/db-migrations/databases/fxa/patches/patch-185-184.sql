SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('185');

DROP TABLE `passkeys`;

UPDATE dbMetadata SET value = '184' WHERE name = 'schema-patch-level';
