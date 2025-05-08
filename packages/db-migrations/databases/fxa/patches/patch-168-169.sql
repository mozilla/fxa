SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('168');

INSERT INTO securityEventNames(name) VALUES ('account.recovery_phone_reset_password_complete'), ('account.recovery_phone_reset_password_failed');

UPDATE dbMetadata SET value = '169' WHERE name = 'schema-patch-level';
