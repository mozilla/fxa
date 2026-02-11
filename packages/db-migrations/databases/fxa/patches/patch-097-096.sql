-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- This migration adds an optional `refreshTokenId` column to the `devices` table,
-- allowing OAuth clients to participate in the sync device ecosystem.

-- DROP PROCEDURE `createDevice_5`;
-- DROP PROCEDURE `updateDevice_6`;
-- DROP PROCEDURE `deleteDevice_4`;
-- DROP PROCEDURE `accountDevices_16`;
-- DROP PROCEDURE `device_3`;

-- ALTER TABLE devices
--   DROP COLUMN refreshTokenId,
--   DROP INDEX UQ_devices_refreshTokenId;

-- ALTER TABLE deviceCommands
--   ADD CONSTRAINT `deviceCommands_ibfk_1` FOREIGN KEY (`commandId`) REFERENCES `deviceCommandIdentifiers` (`commandId`) ON DELETE CASCADE,
--   ADD CONSTRAINT `deviceCommands_ibfk_2` FOREIGN KEY (`uid`, `deviceId`) REFERENCES `devices` (`uid`, `id`) ON DELETE CASCADE;

-- CREATE TABLE `deviceCapabilities` (
--   `uid` binary(16) NOT NULL,
--   `deviceId` binary(16) NOT NULL,
--   `capability` tinyint(3) unsigned NOT NULL,
--   PRIMARY KEY (`uid`,`deviceId`,`capability`),
--   CONSTRAINT `devicecapabilities_ibfk_1` FOREIGN KEY (`uid`, `deviceId`) REFERENCES `devices` (`uid`, `id`) ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- UPDATE dbMetadata SET value = '96' WHERE name = 'schema-patch-level';
