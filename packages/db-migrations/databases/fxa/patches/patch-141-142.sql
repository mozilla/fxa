SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('141');

ALTER TABLE `carts`
  ADD `version` SMALLINT UNSIGNED NOT NULL DEFAULT 0;

UPDATE dbMetadata SET value = '142' WHERE name = 'schema-patch-level';
