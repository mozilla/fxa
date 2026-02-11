SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('162');

INSERT INTO securityEventNames(name) VALUES ('account.recovery_phone_send_code');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_phone_setup_complete');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_phone_signin_complete');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_phone_signin_failed');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_phone_removed');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_codes_replaced');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_codes_created');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_codes_signin_complete');

UPDATE dbMetadata SET value = '163' WHERE name = 'schema-patch-level';
