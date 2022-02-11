CREATE TABLE `clients` (
  `id` binary(8) NOT NULL,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `imageUri` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `redirectUri` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `canGrant` tinyint(1) DEFAULT '0',
  `publicClient` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `trusted` tinyint(1) DEFAULT '0',
  `allowedScopes` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL,
  `hashedSecret` binary(32) DEFAULT NULL,
  `hashedSecretPrevious` binary(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
