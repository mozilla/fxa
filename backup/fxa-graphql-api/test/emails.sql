CREATE TABLE `emails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `normalizedEmail` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `uid` binary(16) NOT NULL,
  `emailCode` binary(16) NOT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `isPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `verifiedAt` bigint(20) unsigned DEFAULT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `normalizedEmail` (`normalizedEmail`),
  KEY `emails_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
