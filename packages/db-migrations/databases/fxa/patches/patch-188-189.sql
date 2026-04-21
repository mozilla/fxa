SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('188');

ALTER TABLE `carts`
  ADD `isFreeTrial` BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE dbMetadata SET value = '189' WHERE name = 'schema-patch-level';
