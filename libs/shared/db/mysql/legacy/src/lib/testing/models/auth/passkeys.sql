-- Foreign keys are omitted, as in the other fixtures here: the tables are
-- created concurrently, so a constraint on accounts would race.
CREATE TABLE `passkeys` (
  `uid` binary(16) NOT NULL,
  `credentialId` varbinary(1023) NOT NULL,
  `publicKey` blob NOT NULL,
  `signCount` int(10) unsigned NOT NULL DEFAULT '0',
  `transports` json NOT NULL,
  `aaguid` binary(16) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `lastUsedAt` bigint(20) unsigned DEFAULT NULL,
  `backupEligible` tinyint(1) NOT NULL DEFAULT '0',
  `backupState` tinyint(1) NOT NULL DEFAULT '0',
  `prfEnabled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`uid`, `credentialId`),
  UNIQUE KEY `idx_credentialId` (`credentialId`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin
