-- Reverse of patch-035-036. Reverse patching is disabled in the runner.

-- DROP TABLE IF EXISTS `accountAuthorizations`;

-- UPDATE dbMetadata SET value = '35' WHERE name = 'schema-patch-level';
