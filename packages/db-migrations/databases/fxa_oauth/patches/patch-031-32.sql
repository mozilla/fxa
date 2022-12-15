-- To support multiple redirect uris, we are changing the column form varchar 256 to 2048
-- should enough to store 20 redirect uris. 
ALTER TABLE `clients` CHANGE COLUMN `redirectUri` `redirectUri` VARCHAR(2048) NULL DEFAULT NULL;

UPDATE dbMetadata SET value = '32' WHERE name = 'schema-patch-level';
