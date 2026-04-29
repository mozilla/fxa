-- Track per-(uid, scope, service) authorization for Firefox browser services.
-- Replaces the hardcoded TOKEN_EXCHANGE_ALLOWED_SCOPES allowlist and is the
-- single source of truth for "user X is connected to service Y".
CREATE TABLE IF NOT EXISTS `accountAuthorizations` (
  `uid` BINARY(16) NOT NULL,
  `scope` VARCHAR(512) NOT NULL,
  `service` VARCHAR(64) NOT NULL,
  `authorizedAt` BIGINT UNSIGNED NOT NULL,
  `lastUsedAt` BIGINT UNSIGNED,
  PRIMARY KEY (`uid`, `scope`, `service`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

UPDATE dbMetadata SET value = '33' WHERE name = 'schema-patch-level';
