-- -- Drop new column and new constraint
-- ALTER TABLE emailBounces
-- DROP COLUMN diagnosticCode;

-- -- Drop new stored procedures
-- DROP PROCEDURE `createEmailBounce_3`;
-- DROP PROCEDURE `fetchEmailBounces_3`;

-- -- Decrement the schema version
-- UPDATE dbMetadata SET value = '126' WHERE name = 'schema-patch-level';
