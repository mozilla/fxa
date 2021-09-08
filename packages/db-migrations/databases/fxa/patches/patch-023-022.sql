-- -- Drop new column and restore callbackPublicKey column type
-- ALTER TABLE devices
-- DROP COLUMN callbackAuthKey,
-- MODIFY COLUMN callbackPublicKey BINARY(32);

-- -- Drop new stored procedures
-- DROP PROCEDURE `accountDevices_4`;
-- DROP PROCEDURE `createDevice_2`;
-- DROP PROCEDURE `updateDevice_2`;
-- DROP PROCEDURE `sessionWithDevice_2`;

-- -- Decrement the schema version
-- UPDATE dbMetadata SET value = '22' WHERE name = 'schema-patch-level';

