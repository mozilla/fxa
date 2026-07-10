/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

CREATE TABLE `wafBypassTokens` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `token` CHAR(36) NOT NULL,
  `clientId` BINARY(8) NULL COMMENT 'FK to clients.id; NULL for standalone tokens (e.g. FxA itself)',
  `createdAt` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_token` (`token`),
  UNIQUE KEY `unique_clientId` (`clientId`),
  FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

UPDATE dbMetadata SET value = '33' WHERE name = 'schema-patch-level';
