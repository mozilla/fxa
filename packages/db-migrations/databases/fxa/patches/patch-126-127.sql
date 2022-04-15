-- adds the 'diagnosticCode' column to emailBounces table
ALTER TABLE emailBounces ADD COLUMN diagnosticCode VARCHAR(255);

UPDATE dbMetadata SET value = '127' WHERE name = 'schema-patch-level';
