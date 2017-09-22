-- DROP INDEX `sessionTokens_createdAt`
-- ON `sessionTokens`
-- ALGORITHM=INPLACE
-- LOCK=NONE;

-- DELETE FROM dbMetadata
-- WHERE name = 'sessionTokensPrunedUntil';

-- DROP PROCEDURE `prune_6`;

-- UPDATE dbMetadata SET value = '66' WHERE name = 'schema-patch-level';

