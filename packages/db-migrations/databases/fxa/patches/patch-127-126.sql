-- -- Drop new column
-- ALTER TABLE emailBounces DROP COLUMN diagnosticCode;

-- -- Decrement the schema version
-- UPDATE dbMetadata SET value = '126' WHERE name = 'schema-patch-level';
