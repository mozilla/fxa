CREATE TABLE `codes` (
  `code` binary(32) NOT NULL,
  `clientId` binary(8) NOT NULL,
  `userId` binary(16) NOT NULL,
  `scope` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `authAt` bigint(20) DEFAULT '0',
  `amr` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `aal` tinyint(4) DEFAULT NULL,
  `offline` tinyint(1) NOT NULL DEFAULT '0',
  `codeChallengeMethod` varchar(256) COLLATE utf8_unicode_ci DEFAULT NULL,
  `codeChallenge` varchar(256) COLLATE utf8_unicode_ci DEFAULT NULL,
  `keysJwe` mediumtext COLLATE utf8_unicode_ci,
  `profileChangedAt` bigint(20) DEFAULT NULL,
  `sessionTokenId` binary(32) DEFAULT NULL,
  PRIMARY KEY (`code`),
  KEY `codes_client_id` (`clientId`),
  KEY `codes_user_id` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
