SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('186');

INSERT INTO securityEventNames(name) VALUES ('account.recovery_codes_set');

UPDATE dbMetadata SET value = '187' WHERE name = 'schema-patch-level';
