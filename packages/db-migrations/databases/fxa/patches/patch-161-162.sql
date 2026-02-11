SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('161');

INSERT INTO securityEventNames(name) VALUES ('session.destroy');

UPDATE dbMetadata SET value = '162' WHERE name = 'schema-patch-level';
