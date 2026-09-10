CALL assertPatchLevel('198');

INSERT INTO securityEventNames(name) VALUES ('account.passkey.verification_success');
INSERT INTO securityEventNames(name) VALUES ('account.passkey.verification_failure');

UPDATE dbMetadata SET value = '199' WHERE name = 'schema-patch-level';
