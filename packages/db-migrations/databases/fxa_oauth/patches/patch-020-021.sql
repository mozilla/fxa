-- Add columns to stash 'amr' and 'aal' on the codes table.
-- The 'amr' column will be a comma-separated string.
-- It's tempting to use MySQL's SET datatype to save on storage space here:
--
--    https://dev.mysql.com/doc/refman/5.7/en/set.html
--
-- But codes are transient, so it doesn't seem worthwhile to
-- trade the maintenance complexity for a little storage space.
ALTER TABLE codes
ADD COLUMN amr VARCHAR(128) AFTER authAt,
ADD COLUMN aal TINYINT AFTER amr,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '21' WHERE name = 'schema-patch-level';
