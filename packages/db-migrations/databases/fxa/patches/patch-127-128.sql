SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('127');

INSERT INTO securityEventNames(name) VALUES ('emails.clearBounces');

UPDATE dbMetadata SET value = '128' WHERE name = 'schema-patch-level';
