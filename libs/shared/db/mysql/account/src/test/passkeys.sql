CREATE TABLE `passkeys` (
  `uid` binary(16) NOT NULL,
  `credentialId` varbinary(1023) NOT NULL,
  `publicKey` blob NOT NULL,
  `signCount` int unsigned NOT NULL DEFAULT '0',
  `transports` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `aaguid` binary(16) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `lastUsedAt` bigint(20) unsigned DEFAULT NULL,
  `backupEligible` tinyint(1) NOT NULL DEFAULT '0',
  `backupState` tinyint(1) NOT NULL DEFAULT '0',
  `prfEnabled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`uid`,`credentialId`),
  UNIQUE KEY `idx_credentialId` (`credentialId`),
  CONSTRAINT `passkeys_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `accounts` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
