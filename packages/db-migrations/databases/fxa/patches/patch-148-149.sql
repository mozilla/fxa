SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('148');

INSERT INTO securityEventNames(name) VALUES ('account.password_reset_otp_sent');

UPDATE dbMetadata SET value = '149' WHERE name = 'schema-patch-level';
