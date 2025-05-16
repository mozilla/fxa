SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('169');

INSERT INTO securityEventNames(name) VALUES ('account.recovery_phone_replace_complete'), ('account.recovery_phone_replace_failure');

UPDATE dbMetadata SET value = '170' WHERE name = 'schema-patch-level';
