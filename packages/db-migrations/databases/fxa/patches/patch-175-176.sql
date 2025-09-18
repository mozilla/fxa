SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('175');

INSERT INTO securityEventNames(name) VALUES ('account.signin.confirm.bypass.ip');

UPDATE dbMetadata SET value = '176' WHERE name = 'schema-patch-level';
