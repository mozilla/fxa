SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('129');

INSERT INTO securityEventNames(name) VALUES ('account.enable'), ('account.disable');

UPDATE dbMetadata SET value = '130' WHERE name = 'schema-patch-level';
