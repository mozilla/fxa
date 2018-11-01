--  Remove `authAt` column from the `codes` table.
--  (commented out to avoid accidentally running this in production...)

-- ALTER TABLE codes DROP COLUMN authAt;

-- UPDATE dbMetadata SET value = '2' WHERE name = 'schema-patch-level';

