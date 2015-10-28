-- Re-create NOT NULL constraint on the email column.
-- We weren't able to drop it in production, this migration
-- brings it back in our dev environments.

ALTER TABLE tokens MODIFY COLUMN email VARCHAR(256) NOT NULL;

UPDATE dbMetadata SET value = '13' WHERE name = 'schema-patch-level';
