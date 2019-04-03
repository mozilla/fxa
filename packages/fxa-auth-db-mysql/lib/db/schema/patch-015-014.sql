-- -- drop new stored procedures
-- DROP PROCEDURE `createSessionToken_2`;
-- DROP PROCEDURE `sessionToken_2`;
-- DROP PROCEDURE `updateSessionToken_1`;

-- -- drop new columns
-- ALTER TABLE sessionTokens DROP COLUMN uaBrowser;
-- ALTER TABLE sessionTokens DROP COLUMN uaBrowserVersion;
-- ALTER TABLE sessionTokens DROP COLUMN uaOS;
-- ALTER TABLE sessionTokens DROP COLUMN uaOSVersion;
-- ALTER TABLE sessionTokens DROP COLUMN uaDeviceType;
-- ALTER TABLE sessionTokens DROP COLUMN lastAccessTime;

-- -- Schema patch-level decrement.
-- UPDATE dbMetadata SET value = '14' WHERE name = 'schema-patch-level';
