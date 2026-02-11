CREATE TABLE `emails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `normalizedEmail` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `uid` binary(16) NOT NULL,
  `emailCode` binary(16) NOT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `isPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `verifiedAt` bigint unsigned DEFAULT NULL,
  `createdAt` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `normalizedEmail` (`normalizedEmail`),
  KEY `emails_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;
