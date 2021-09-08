--DROP PROCEDURE `accountDevices_9`;
--DROP PROCEDURE `sessions_4`;
--DROP PROCEDURE `sessionWithDevice_7`;
--DROP PROCEDURE `sessionTokenWithVerificationStatus_5`;
--DROP PROCEDURE `sessionToken_6`;
--DROP PROCEDURE `createSessionToken_6`;

--ALTER TABLE `sessionTokens`
--ADD COLUMN `uaFormFactor` VARCHAR(255),
--ALGORITHM = INPLACE, LOCK = NONE;

--UPDATE dbMetadata SET value = '59' WHERE name = 'schema-patch-level';

