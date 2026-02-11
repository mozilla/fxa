SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('174');

INSERT INTO securityEventNames(name) VALUES ('account.two_factor_replace_success'), ('account.two_factor_replace_failure');

UPDATE dbMetadata SET value = '175' WHERE name = 'schema-patch-level';
