CREATE TABLE `tokens` (
  `token` binary(32) NOT NULL,
  `clientId` binary(8) NOT NULL,
  `userId` binary(16) NOT NULL,
  `type` varchar(16) COLLATE utf8_unicode_ci NOT NULL,
  `scope` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NOT NULL DEFAULT '1980-01-01 00:00:00',
  `profileChangedAt` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`token`),
  KEY `tokens_client_id` (`clientId`),
  KEY `tokens_user_id` (`userId`),
  KEY `idx_expiresAt` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
