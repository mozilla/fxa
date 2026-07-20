CALL assertPatchLevel('182');

INSERT INTO securityEventNames(name) VALUES ('account.passkey.registration_success');
INSERT INTO securityEventNames(name) VALUES ('account.passkey.registration_failure');
INSERT INTO securityEventNames(name) VALUES ('account.passkey.removed');
INSERT INTO securityEventNames(name) VALUES ('account.passkey.authentication_success');
INSERT INTO securityEventNames(name) VALUES ('account.passkey.authentication_failure');

UPDATE dbMetadata SET value = '183' WHERE name = 'schema-patch-level';
