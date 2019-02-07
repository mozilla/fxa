USE fxa;
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- Clear any existing triggers
DROP TRIGGER IF EXISTS pt_osc_fxa_accounts_del;
DROP TRIGGER IF EXISTS pt_osc_fxa_accounts_ins;
DROP TRIGGER IF EXISTS pt_osc_fxa_accounts_upd;

-- Create a mirror copy of fxa.accounts schema and data
DROP TABLE IF EXISTS _accounts_new;
CREATE TABLE `_accounts_new` (
  `uid` binary(16) NOT NULL,
  `normalizedEmail` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `emailCode` binary(16) NOT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `kA` binary(32) NOT NULL,
  `wrapWrapKb` binary(32) NOT NULL,
  `authSalt` binary(32) NOT NULL,
  `verifyHash` binary(32) NOT NULL,
  `verifierVersion` tinyint(3) unsigned NOT NULL,
  `verifierSetAt` bigint(20) unsigned NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `locale` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lockedAt` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `normalizedEmail` (`normalizedEmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci SELECT * FROM accounts;

-- Add a new columnn
ALTER TABLE _accounts_new ADD COLUMN profileChangedAt BIGINT UNSIGNED DEFAULT NULL;

-- Install the triggers
--
CREATE TRIGGER `pt_osc_fxa_accounts_del` AFTER DELETE ON `fxa`.`accounts` FOR EACH ROW
  DELETE FROM `fxa`.`_accounts_new` WHERE `fxa`.`_accounts_new`.`uid` <=> OLD.`uid`;

--
CREATE TRIGGER `pt_osc_fxa_accounts_ins` AFTER INSERT ON `fxa`.`accounts` FOR EACH ROW
  REPLACE INTO `fxa`.`_accounts_new` (`uid`, `normalizedemail`, `email`, `emailcode`, `emailverified`, `ka`, `wrapwrapkb`, `authsalt`,
               `verifyhash`, `verifierversion`, `verifiersetat`, `createdat`, `locale`, `lockedat`) 
  VALUES (NEW.`uid`, NEW.`normalizedemail`, NEW.`email`, NEW.`emailcode`, NEW.`emailverified`, NEW.`ka`, NEW.`wrapwrapkb`, NEW.`authsalt`,
          NEW.`verifyhash`, NEW.`verifierversion`, NEW.`verifiersetat`, NEW.`createdat`, NEW.`locale`, NEW.`lockedat`);

--
DELIMITER $$
CREATE TRIGGER `pt_osc_fxa_accounts_upd` AFTER UPDATE ON `fxa`.`accounts` FOR EACH ROW
  BEGIN
    DELETE FROM `fxa`.`_accounts_new`
      WHERE !(OLD.`uid` <=> NEW.`uid`)
        AND `fxa`.`_accounts_new`.`uid` <=> OLD.`uid`;
    REPLACE INTO `fxa`.`_accounts_new` (`uid`, `normalizedemail`, `email`, `emailcode`, `emailverified`, `ka`, `wrapwrapkb`,
                                        `authsalt`, `verifyhash`, `verifierversion`, `verifiersetat`, `createdat`, `locale`, `lockedat`)
    VALUES (NEW.`uid`, NEW.`normalizedemail`, NEW.`email`, NEW.`emailcode`, NEW.`emailverified`, NEW.`ka`, NEW.`wrapwrapkb`,
            NEW.`authsalt`, NEW.`verifyhash`, NEW.`verifierversion`, NEW.`verifiersetat`, NEW.`createdat`, NEW.`locale`, NEW.`lockedat`);
  END
$$
DELIMITER ;

-- now run tests, and then `source ./scripts/union-compare-two-tables.sql

