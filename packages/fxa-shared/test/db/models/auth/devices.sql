CREATE TABLE `devices` (
  `uid` binary(16) NOT NULL,
  `id` binary(16) NOT NULL,
  `sessionTokenId` binary(32) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `nameUtf8` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `type` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` bigint(20) unsigned DEFAULT NULL,
  `callbackURL` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `callbackPublicKey` char(88) COLLATE utf8_unicode_ci DEFAULT NULL,
  `callbackAuthKey` char(24) COLLATE utf8_unicode_ci DEFAULT NULL,
  `callbackIsExpired` tinyint(1) NOT NULL DEFAULT '0',
  `refreshTokenId` binary(32) DEFAULT NULL,
  PRIMARY KEY (`uid`,`id`),
  UNIQUE KEY `UQ_devices_sessionTokenId` (`uid`,`sessionTokenId`),
  UNIQUE KEY `UQ_devices_refreshTokenId` (`uid`,`refreshTokenId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
