-- Track per-(uid, scope, service) authorization for Firefox browser services.
-- Source of truth for "user X is connected to service Y" for configured
-- browser-service scopes. Unconfigured scopes still fall back to the
-- legacy TOKEN_EXCHANGE_ALLOWED_SCOPES allowlist in lib/routes/oauth/token.js.
CREATE TABLE IF NOT EXISTS `accountAuthorizations` (
  `uid` BINARY(16) NOT NULL,
  `scope` VARCHAR(512) NOT NULL,
  `service` VARCHAR(64) NOT NULL,
  `authorizedAt` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`uid`, `scope`, `service`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

UPDATE dbMetadata SET value = '34' WHERE name = 'schema-patch-level';
