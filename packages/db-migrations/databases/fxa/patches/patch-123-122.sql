-- -- Drop new column and new constraint
-- ALTER TABLE emailBounces
-- DROP COLUMN emailTypeId;

-- -- Drop new stored procedures
-- DROP PROCEDURE `createEmailBounce_2`;
-- DROP PROCEDURE `fetchEmailBounces_2`;

-- -- Decrement the schema version
-- UPDATE dbMetadata SET value = '122' WHERE name = 'schema-patch-level';
