CREATE TABLE `signinCodes` (
  `hash` binary(32) NOT NULL,
  `uid` binary(16) NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `flowId` binary(32) DEFAULT NULL,
  PRIMARY KEY (`hash`),
  KEY `signinCodes_createdAt` (`createdAt`),
  KEY `signinCodes_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
