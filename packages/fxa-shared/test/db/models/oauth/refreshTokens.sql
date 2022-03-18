CREATE TABLE `refreshTokens` (
  `token` binary(32) NOT NULL,
  `clientId` binary(8) NOT NULL,
  `userId` binary(16) NOT NULL,
  `scope` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUsedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `profileChangedAt` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`token`),
  KEY `tokens_client_id` (`clientId`),
  KEY `tokens_user_id` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
