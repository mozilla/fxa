--DROP PROCEDURE `accountDevices_10`;
--DROP PROCEDURE `sessions_5`;
--DROP PROCEDURE `sessionWithDevice_8`;
--DROP PROCEDURE `sessionTokenWithVerificationStatus_6`;
--DROP PROCEDURE `sessionToken_7`;
--DROP PROCEDURE `createSessionToken_7`;

--ALTER TABLE `sessionTokens`
--DROP COLUMN `uaFormFactor`,
--ALGORITHM = INPLACE, LOCK = NONE;

--UPDATE dbMetadata SET value = '60' WHERE name = 'schema-patch-level';

