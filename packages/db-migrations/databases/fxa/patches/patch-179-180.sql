SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('179');

-- updates emailBounce table diagnosticCode from 255 to 1024 characters

ALTER TABLE emailBounce
  MODIFY COLUMN diagnosticCode VARCHAR(1024) NOT NULL;

UPDATE dbMetadata SET value = '180' WHERE name = 'schema-patch-level';
