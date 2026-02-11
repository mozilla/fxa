CALL assertPatchLevel('177');

INSERT INTO securityEventNames(name) VALUES ('account.signin_confirm_bypass_known_device');

UPDATE dbMetadata SET value = '178' WHERE name = 'schema-patch-level';
