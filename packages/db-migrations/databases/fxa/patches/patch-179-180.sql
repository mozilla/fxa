SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('179');

-- updates emailBounces table diagnosticCode from 255 to 1024 characters

ALTER TABLE emailBounces
    MODIFY COLUMN diagnosticCode VARCHAR(1024) DEFAULT '',
    ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '180' WHERE name = 'schema-patch-level';
