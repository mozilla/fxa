--DROP PROCEDURE `accountDevices_8`;
--DROP PROCEDURE `sessions_3`;
--DROP PROCEDURE `sessionWithDevice_6`;
--DROP PROCEDURE `sessionTokenWithVerificationStatus_4`;
--DROP PROCEDURE `sessionToken_5`;
--DROP PROCEDURE `createSessionToken_5`;

--ALTER TABLE `sessionTokens`
--DROP COLUMN `uaFormFactor`,
--ALGORITHM = INPLACE, LOCK = NONE;

--UPDATE dbMetadata SET value = '58' WHERE name = 'schema-patch-level';

