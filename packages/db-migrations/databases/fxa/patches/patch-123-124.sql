SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('123');
-- Creates a new table to store linked account information
CREATE TABLE `linkedAccounts` (
  `uid` BINARY(16),
-- The `id` property is a unique identifier in the provider account system.
-- For example, for Google, the unique id is specified in the `sub` property of the id token
-- and has a maximum length of 255 chars. Apple and other providers use 16-24 chars for unique ids.
-- This should give us plenty of wiggle room.
--
-- Ref: https://developers.google.com/identity/protocols/oauth2/openid-connect?hl=lt
  `id` VARCHAR(255) NOT NULL,
  `providerId` TINYINT NOT NULL,
  `authAt` BIGINT UNSIGNED,
  `enabled` BOOLEAN NOT NULL,
  PRIMARY KEY (uid, id, providerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

UPDATE dbMetadata SET value = '124' WHERE name = 'schema-patch-level';
