CREATE TABLE `avatars` (
  `id` binary(16) NOT NULL,
  `url` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `userId` binary(16) NOT NULL,
  `providerId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `avatars_user_id` (`userId`),
  KEY `providerId` (`providerId`),
  CONSTRAINT `avatars_ibfk_1` FOREIGN KEY (`providerId`) REFERENCES `avatar_providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
