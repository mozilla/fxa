CREATE TABLE `recoveryCodes` (
  `id` bigint AUTO_INCREMENT PRIMARY KEY,
  `uid` binary(16) DEFAULT NULL,
  `codeHash` binary(32) DEFAULT NULL,
  `salt` binary(32) DEFAULT NULL,
  KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
