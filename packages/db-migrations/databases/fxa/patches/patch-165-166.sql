SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('165');

INSERT INTO securityEventNames(name) VALUES ('account.must_reset');

UPDATE dbMetadata SET value = '166' WHERE name = 'schema-patch-level';
