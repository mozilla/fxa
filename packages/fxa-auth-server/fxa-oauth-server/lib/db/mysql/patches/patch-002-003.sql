--  Add `authAt` column to the `codes` table.

ALTER TABLE codes ADD COLUMN authAt BIGINT DEFAULT 0;

UPDATE dbMetadata SET value = '3' WHERE name = 'schema-patch-level';

