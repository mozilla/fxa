-- accountAuthorizations: per-user OAuth consent ledger. One row per
-- (uid, scope, service, clientId). Written by the /authorization path on
-- consent acceptance (upserts, bumping lastAuthorizedTosAt). Read by the
-- /authorization pre-prompt check and by token-exchange; both lookups
-- are (uid, scope, service), satisfied by the PK left-prefix. Cleared
-- only on account deletion via AccountDeleteManager.
--
-- The scope-to-service mapping that drives token-exchange resolution
-- lives in auth-server Convict config (oauthServer.exchange.serviceScopes),
-- not on a column here. Keeping it out of the DB makes adding a new
-- browser service a config + deploy, with no schema change.
CREATE TABLE IF NOT EXISTS `accountAuthorizations` (
  `uid` BINARY(16) NOT NULL,
  `scope` VARCHAR(256) NOT NULL DEFAULT '',
  `service` VARCHAR(64) NOT NULL DEFAULT '',
  `clientId` BINARY(8) NOT NULL,
  `firstAuthorizedTosAt` BIGINT UNSIGNED NOT NULL,
  `lastAuthorizedTosAt` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`uid`, `scope`, `service`, `clientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

UPDATE dbMetadata SET value = '36' WHERE name = 'schema-patch-level';
