-- Drop the accountAuthorizations table left behind on environments that
-- ran the (since-reverted) level-34 migration. IF EXISTS keeps this safe
-- on environments where the table was never created.

DROP TABLE IF EXISTS `accountAuthorizations`;

UPDATE dbMetadata SET value = '35' WHERE name = 'schema-patch-level';
