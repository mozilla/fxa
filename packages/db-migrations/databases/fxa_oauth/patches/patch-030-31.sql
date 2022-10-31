ALTER TABLE `clients` ADD COLUMN `notes` TEXT;

UPDATE dbMetadata SET value = '31' WHERE name = 'schema-patch-level';
