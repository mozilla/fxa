-- Tables to support https://mozilla-hub.atlassian.net/browse/FXA-6773

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('152');

CREATE TABLE IF NOT EXISTS `groups` (
  `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `display_name` VARCHAR(255) NOT NULL,
  `capabilities` VARCHAR(1024) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `accountGroups` (
  `uid` BINARY(16) NOT NULL,
  `group_id` SMALLINT UNSIGNED NOT NULL,
  `role` ENUM('admin', 'owner', 'participant') NOT NULL,
  `managed_by` ENUM('automatic', 'manual') NOT NULL,
  `expires` BIGINT UNSIGNED DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`uid`, `group_id`),
  FOREIGN KEY (`uid`) REFERENCES `accounts`(`uid`) ON DELETE CASCADE,
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `groups` (`name`, `display_name`, `capabilities`)
  VALUES ('foxfooding', 'Foxfooding', 'foxfooding');

UPDATE dbMetadata SET value = '153' WHERE name = 'schema-patch-level';
