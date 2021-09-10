--ALTER TABLE `devices`
--DROP COLUMN `callbackIsExpired`,
--ALGORITHM = INPLACE, LOCK = NONE;

-- -- Drop new stored procedures
-- DROP PROCEDURE `updateDevice_4`;
-- DROP PROCEDURE `sessionWithDevice_9`;
-- DROP PROCEDURE `sessions_6`;
-- DROP PROCEDURE `accountDevices_11`;
-- DROP PROCEDURE `deviceFromTokenVerificationId_2`;

-- UPDATE dbMetadata SET value = '62' WHERE name = 'schema-patch-level';

