-- Begins process of renaming "whitelisted" to "trusted".
-- We need to drop the "whitelisted" column in a separate patch in order
-- to safely deploy this without downtime.

ALTER TABLE clients ADD COLUMN trusted BOOLEAN DEFAULT FALSE;
UPDATE clients SET trusted=whitelisted;

UPDATE dbMetadata SET value = '5' WHERE name = 'schema-patch-level';
