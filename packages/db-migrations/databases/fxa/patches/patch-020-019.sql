-- -- Drop new column and new constraint
-- ALTER TABLE devices
-- DROP COLUMN callbackPublicKey,
-- DROP INDEX UQ_devices_sessionTokenId;

-- -- Drop new stored procedures
-- DROP PROCEDURE `accountDevices_3`;
-- DROP PROCEDURE `createDevice_1`;
-- DROP PROCEDURE `updateDevice_1`;

-- -- Decrement the schema version
-- UPDATE dbMetadata SET value = '19' WHERE name = 'schema-patch-level';

