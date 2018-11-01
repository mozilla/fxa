-- Remove support for Client Developers for OAuth clients

-- DROP TABLE clientDevelopers;
-- DROP TABLE developers;

-- UPDATE dbMetadata SET value = '3' WHERE name = 'schema-patch-level';
