-- This removes the `profileChangedAt` column on the tokens table.
-- Since the tokens table is so large, this migration causes some issues.
-- When the tokens get purged and the table is a bit smaller we can attempt to
-- add this column.
ALTER TABLE tokens DROP COLUMN profileChangedAt,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '24' WHERE name = 'schema-patch-level';
