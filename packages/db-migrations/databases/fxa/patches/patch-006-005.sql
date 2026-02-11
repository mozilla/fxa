-- -- make sure passwordChangeTokens(uid) is unique
-- -- ie. only one row for each accounts.uid
-- ALTER TABLE passwordChangeTokens DROP INDEX `uid`;

-- UPDATE dbMetadata SET value = '5' WHERE name = 'schema-patch-level';
