CREATE TABLE `passwordForgotTokens` (
  `tokenId` binary(32) NOT NULL,
  `tokenData` binary(32) NOT NULL,
  `uid` binary(16) NOT NULL,
  `passCode` binary(16) NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `tries` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`tokenId`),
  UNIQUE KEY `uid` (`uid`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
