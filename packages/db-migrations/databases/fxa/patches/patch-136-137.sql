SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('136');

INSERT INTO securityEventNames(name) VALUES ('account.login.failure');
INSERT INTO securityEventNames(name) VALUES ('account.two_factor_added');
INSERT INTO securityEventNames(name) VALUES ('account.two_factor_requested');
INSERT INTO securityEventNames(name) VALUES ('account.two_factor_challenge_failure');
INSERT INTO securityEventNames(name) VALUES ('account.two_factor_challenge_success');
INSERT INTO securityEventNames(name) VALUES ('account.two_factor_removed');
INSERT INTO securityEventNames(name) VALUES ('account.password_reset_requested');
INSERT INTO securityEventNames(name) VALUES ('account.password_reset_success');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_key_added');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_key_challenge_failure');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_key_challenge_success');
INSERT INTO securityEventNames(name) VALUES ('account.recovery_key_removed');
INSERT INTO securityEventNames(name) VALUES ('account.password_added');
INSERT INTO securityEventNames(name) VALUES ('account.password_changed');
INSERT INTO securityEventNames(name) VALUES ('account.secondary_email_added');
INSERT INTO securityEventNames(name) VALUES ('account.secondary_email_removed');
INSERT INTO securityEventNames(name) VALUES ('account.primary_secondary_swapped');

UPDATE dbMetadata SET value = '137' WHERE name = 'schema-patch-level';
