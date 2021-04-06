CREATE TABLE `recoveryKeys` (
  `uid` binary(16) NOT NULL,
  `recoveryData` text COLLATE utf8mb4_bin,
  `recoveryKeyIdHash` binary(32) NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `verifiedAt` bigint(20) unsigned DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`uid`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin
