-- Recreates the accountAuthorizations table from the reverted level-34
-- attempt so the forward chain is complete on environments still at 33.
-- Patch 34->35 drops the table; nothing in current code reads or writes it.
CREATE TABLE IF NOT EXISTS `accountAuthorizations` (
  `uid` BINARY(16) NOT NULL,
  `scope` VARCHAR(512) NOT NULL,
  `service` VARCHAR(64) NOT NULL,
  `authorizedAt` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`uid`, `scope`, `service`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

UPDATE dbMetadata SET value = '34' WHERE name = 'schema-patch-level';
