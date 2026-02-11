CREATE TABLE `unblockCodes` (
  `uid` binary(16) NOT NULL,
  `unblockCodeHash` binary(32) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  PRIMARY KEY (`uid`,`unblockCodeHash`),
  KEY `unblockCodes_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
