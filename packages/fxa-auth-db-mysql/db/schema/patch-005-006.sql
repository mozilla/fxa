-- make sure passwordChangeTokens(uid) is unique
-- ie. only one row for each accounts.uid
ALTER TABLE passwordChangeTokens ADD UNIQUE INDEX `uid` (uid);

UPDATE dbMetadata SET value = '6' WHERE name = 'schema-patch-level';
