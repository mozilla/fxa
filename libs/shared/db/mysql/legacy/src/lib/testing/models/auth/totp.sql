CREATE TABLE `totp` (
  `uid` binary(16) NOT NULL,
  `sharedSecret` varchar(80) COLLATE utf8mb4_bin NOT NULL,
  `epoch` bigint(20) NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `enabled` tinyint(1) DEFAULT '1',
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
