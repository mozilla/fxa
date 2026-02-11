SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('149');

INSERT INTO securityEventNames(name) VALUES ('account.password_reset_otp_verified');

UPDATE dbMetadata SET value = '150' WHERE name = 'schema-patch-level';
