-- Adds new "termsUri" and "privacyUri" columns for third-party clients.

--ALTER TABLE clients ADD COLUMN termsUri VARCHAR(256) NOT NULL AFTER redirectUri;
--ALTER TABLE clients ADD COLUMN privacyUri VARCHAR(256) NOT NULL AFTER termsUri;

--UPDATE dbMetadata SET value = '15' WHERE name = 'schema-patch-level';
