-- Begins process of renaming "whitelisted" to "trusted".
-- We need to drop the "whitelisted" column in a separate patch in order
-- to safely deploy this without downtime.

ALTER TABLE clients ADD COLUMN trusted BOOLEAN DEFAULT FALSE;
UPDATE clients SET trusted=whitelisted;

-- Adds new "termsUri" and "privacyUri" columns for third-party clients.

ALTER TABLE clients ADD COLUMN termsUri VARCHAR(256) NOT NULL AFTER redirectUri;
ALTER TABLE clients ADD COLUMN privacyUri VARCHAR(256) NOT NULL AFTER termsUri;

UPDATE dbMetadata SET value = '5' WHERE name = 'schema-patch-level';
