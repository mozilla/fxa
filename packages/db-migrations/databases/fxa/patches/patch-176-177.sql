CALL assertPatchLevel('176');

INSERT INTO securityEventNames(name) VALUES ('account.signin_confirm_bypass_known_ip'), ('account.signin_confirm_bypass_new_account');

UPDATE dbMetadata SET value = '177' WHERE name = 'schema-patch-level';
