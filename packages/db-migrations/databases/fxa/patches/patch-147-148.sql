SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('147');

ALTER TABLE `carts`
  Add `eligibilityStatus` ENUM('create', 'upgrade', 'downgrade', 'blocked_iap', 'invalid') NOT NULL;

UPDATE dbMetadata SET value = '148' WHERE name = 'schema-patch-level';
